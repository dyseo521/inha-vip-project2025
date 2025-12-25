/**
 * S3 Vectors Migration Script
 * Migrates existing S3 JSON vectors to S3 Vectors index
 *
 * Prerequisites:
 * 1. Create S3 Vectors bucket in AWS Console:
 *    - Go to S3 Console → Vector buckets → Create vector bucket
 *    - Name: eecar-vectors-index (lowercase, 3-63 chars)
 *    - Encryption: SSE-S3 (default)
 *
 * 2. Create Index in Console:
 *    - Index name: parts-vectors
 *    - Dimension: 1024 (Titan Embed v2)
 *    - Distance metric: Cosine
 *    - Filterable metadata: category, manufacturer (auto)
 *    - Non-filterable metadata: name, description
 *
 * Usage:
 * npx ts-node scripts/migrate-to-s3-vectors.ts
 *
 * References:
 * - https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-buckets-create.html
 * - https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-getting-started.html
 */

import {
  S3VectorsClient,
  PutVectorsCommand,
  QueryVectorsCommand,
  GetIndexCommand,
  ListIndexesCommand,
} from '@aws-sdk/client-s3vectors';
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

// Configuration
const AWS_REGION = 'ap-northeast-2';
const SOURCE_BUCKET = process.env.VECTORS_BUCKET_NAME || 'eecar-vectors-425454508084';  // Existing S3 bucket with JSON vectors
const TARGET_BUCKET = process.env.S3_VECTORS_BUCKET || 'eecar-vectors-index-12234628';  // New S3 Vectors bucket
const INDEX_NAME = 'parts-vectors';
const DYNAMODB_TABLE = process.env.PARTS_TABLE_NAME || 'eecar-parts-table';

// Initialize clients
const s3Client = new S3Client({ region: AWS_REGION });
const s3VectorsClient = new S3VectorsClient({ region: AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: AWS_REGION });

interface VectorData {
  partId: string;
  vector: number[];
  metadata: {
    category: string;
    manufacturer: string;
    price: number;
    name: string;
    soh?: number;
  };
}

/**
 * List all vector keys from source S3 bucket
 */
async function listVectorKeys(): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: SOURCE_BUCKET,
        Prefix: 'parts/',
        ContinuationToken: continuationToken,
      })
    );

    if (response.Contents) {
      keys.push(...response.Contents.map(obj => obj.Key!).filter(k => k.endsWith('.json')));
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

/**
 * Get vector from source S3 bucket
 */
async function getVector(key: string): Promise<number[] | null> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: SOURCE_BUCKET,
        Key: key,
      })
    );

    const body = await response.Body?.transformToString();
    if (!body) return null;

    const data = JSON.parse(body);
    return data.embedding || data.vector || data;
  } catch (error) {
    console.error(`Failed to get vector for ${key}:`, error);
    return null;
  }
}

/**
 * Get part metadata from DynamoDB
 */
async function getPartMetadata(partId: string): Promise<any | null> {
  try {
    const response = await dynamoClient.send(
      new GetItemCommand({
        TableName: DYNAMODB_TABLE,
        Key: {
          PK: { S: `PART#${partId}` },
          SK: { S: 'METADATA' },
        },
      })
    );

    if (!response.Item) return null;
    return unmarshall(response.Item);
  } catch (error) {
    console.error(`Failed to get metadata for ${partId}:`, error);
    return null;
  }
}

/**
 * Verify S3 Vectors index exists
 * API Reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3vectors/
 */
async function verifyIndex(): Promise<boolean> {
  try {
    // List all indexes in the vector bucket
    const response = await s3VectorsClient.send(
      new ListIndexesCommand({
        vectorBucketName: TARGET_BUCKET,
      })
    );

    const index = response.indexes?.find((i: any) => i.indexName === INDEX_NAME);

    if (index) {
      console.log('Index found:', {
        name: index.indexName,
        creationTime: index.creationTime,
      });

      // Get detailed index info
      const detailResponse = await s3VectorsClient.send(
        new GetIndexCommand({
          vectorBucketName: TARGET_BUCKET,
          indexName: INDEX_NAME,
        })
      );

      console.log('Index details:', detailResponse);
      return true;
    }

    console.error(`Index ${INDEX_NAME} not found in bucket ${TARGET_BUCKET}`);
    console.error('Please create the index in AWS Console first.');
    return false;
  } catch (error: any) {
    console.error('Error verifying index:', error.message || error);
    if (error.name === 'ResourceNotFoundException' || error.name === 'NoSuchVectorBucket') {
      console.error(`Vector bucket ${TARGET_BUCKET} not found.`);
      console.error('Please create the vector bucket in AWS Console first.');
      return false;
    }
    throw error;
  }
}

/**
 * Migrate vectors in batches
 * API: PutVectorsCommand - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3vectors/
 *
 * Vector structure:
 * {
 *   key: string,                    // unique identifier
 *   data: { float32: number[] },    // vector embedding
 *   metadata: { key: value }        // filterable/non-filterable metadata
 * }
 */
async function migrateVectors(vectors: VectorData[]): Promise<void> {
  const BATCH_SIZE = 100; // S3 Vectors supports batch inserts

  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);

    try {
      await s3VectorsClient.send(
        new PutVectorsCommand({
          vectorBucketName: TARGET_BUCKET,
          indexName: INDEX_NAME,
          vectors: batch.map(v => ({
            key: v.partId,
            data: {
              float32: v.vector, // number[] is auto-converted
            },
            metadata: {
              // Filterable metadata (can be used in query filters)
              category: v.metadata.category,
              manufacturer: v.metadata.manufacturer,
              price: String(v.metadata.price), // S3 Vectors metadata supports string values
              // Non-filterable metadata (returned but not filterable)
              name: v.metadata.name,
              ...(v.metadata.soh && { soh: String(v.metadata.soh) }),
            },
          })),
        })
      );

      console.log(`Migrated batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} vectors`);
    } catch (error) {
      console.error(`Failed to migrate batch starting at ${i}:`, error);
      throw error;
    }
  }
}

/**
 * Verify migration by running test query
 * API: QueryVectorsCommand
 */
async function verifyMigration(testVector: number[]): Promise<void> {
  try {
    const response = await s3VectorsClient.send(
      new QueryVectorsCommand({
        vectorBucketName: TARGET_BUCKET,
        indexName: INDEX_NAME,
        queryVector: {
          float32: testVector,
        },
        topK: 5,
        returnMetadata: true,
        returnDistance: true,
      })
    );

    console.log('Migration verification - test query results:');
    response.vectors?.forEach((v: any, i: number) => {
      const name = v.metadata?.name || 'N/A';
      console.log(`  ${i + 1}. ${v.key} (distance: ${v.distance?.toFixed(4)}) - ${name}`);
    });
  } catch (error) {
    console.error('Migration verification failed:', error);
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('=== S3 Vectors Migration Script ===\n');
  console.log('Configuration:');
  console.log(`  Source bucket: ${SOURCE_BUCKET}`);
  console.log(`  Target bucket: ${TARGET_BUCKET}`);
  console.log(`  Index name: ${INDEX_NAME}`);
  console.log(`  DynamoDB table: ${DYNAMODB_TABLE}\n`);

  // Step 1: Verify index exists
  console.log('Step 1: Verifying S3 Vectors index...');
  const indexExists = await verifyIndex();
  if (!indexExists) {
    process.exit(1);
  }

  // Step 2: List source vectors
  console.log('\nStep 2: Listing source vectors...');
  const vectorKeys = await listVectorKeys();
  console.log(`Found ${vectorKeys.length} vectors to migrate`);

  if (vectorKeys.length === 0) {
    console.log('No vectors to migrate. Exiting.');
    return;
  }

  // Step 3: Load vectors and metadata
  console.log('\nStep 3: Loading vectors and metadata...');
  const vectorsToMigrate: VectorData[] = [];

  for (const key of vectorKeys) {
    const partId = key.split('/')[1]?.replace('.json', '');
    if (!partId) continue;

    const vector = await getVector(key);
    if (!vector) continue;

    const metadata = await getPartMetadata(partId);
    if (!metadata) {
      console.warn(`No metadata found for ${partId}, using defaults`);
    }

    vectorsToMigrate.push({
      partId,
      vector,
      metadata: {
        category: metadata?.category || 'unknown',
        manufacturer: metadata?.manufacturer || 'unknown',
        price: metadata?.price || 0,
        name: metadata?.name || partId,
        soh: metadata?.batteryHealth?.soh,
      },
    });

    if (vectorsToMigrate.length % 10 === 0) {
      console.log(`  Loaded ${vectorsToMigrate.length}/${vectorKeys.length} vectors`);
    }
  }

  console.log(`Loaded ${vectorsToMigrate.length} vectors with metadata`);

  // Step 4: Migrate to S3 Vectors
  console.log('\nStep 4: Migrating to S3 Vectors...');
  await migrateVectors(vectorsToMigrate);
  console.log('Migration complete!');

  // Step 5: Verify migration
  console.log('\nStep 5: Verifying migration...');
  if (vectorsToMigrate.length > 0) {
    await verifyMigration(vectorsToMigrate[0].vector);
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Total vectors migrated: ${vectorsToMigrate.length}`);
  console.log(`Target: s3://${TARGET_BUCKET}/${INDEX_NAME}`);
}

// Run migration
main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
