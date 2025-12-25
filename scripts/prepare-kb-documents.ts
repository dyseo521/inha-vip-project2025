/**
 * Bedrock Knowledge Base Document Preparation Script
 * Converts DynamoDB part data to KB-compatible JSON documents
 *
 * Prerequisites:
 * 1. Create S3 bucket for KB documents: eecar-documents-{accountId}
 * 2. Create folder structure: kb-parts/
 *
 * Usage:
 * npx ts-node scripts/prepare-kb-documents.ts
 *
 * After running:
 * 1. Create Knowledge Base in AWS Console
 * 2. Point data source to s3://eecar-documents-xxx/kb-parts/
 * 3. Configure vector store (S3 Vectors recommended)
 * 4. Sync the Knowledge Base
 */

import {
  DynamoDBClient,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { unmarshall } from '@aws-sdk/util-dynamodb';

// Configuration
const AWS_REGION = 'ap-northeast-2';
const DYNAMODB_TABLE = process.env.PARTS_TABLE_NAME || 'eecar-parts-table';
const TARGET_BUCKET = process.env.DOCUMENTS_BUCKET_NAME || 'eecar-documents';
const KB_PREFIX = 'kb-parts';

// Initialize clients
const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const s3Client = new S3Client({ region: AWS_REGION });

// Category Korean names
const CATEGORY_KOREAN: Record<string, string> = {
  'battery': '배터리',
  'motor': '모터',
  'inverter': '인버터',
  'body-chassis-frame': '차체 프레임',
  'body-panel': '바디 패널',
  'body-door': '도어',
  'body-window': '창문/유리',
};

interface KBDocument {
  partId: string;
  title: string;
  content: string;
  metadata: {
    category: string;
    categoryKorean: string;
    manufacturer: string;
    price: number;
    condition: string;
    soh?: number;
  };
}

/**
 * Scan all parts from DynamoDB
 */
async function scanAllParts(): Promise<any[]> {
  const parts: any[] = [];
  let lastEvaluatedKey: any = undefined;

  do {
    const response = await dynamoClient.send(
      new ScanCommand({
        TableName: DYNAMODB_TABLE,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': { S: 'PART#' },
          ':sk': { S: 'METADATA' },
        },
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    if (response.Items) {
      parts.push(...response.Items.map(item => unmarshall(item)));
    }

    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return parts;
}

/**
 * Generate content text for Knowledge Base
 */
function generateContent(part: any): string {
  const lines: string[] = [];

  // Title and basic info
  lines.push(`# ${part.name}`);
  lines.push('');
  lines.push(`## 기본 정보`);
  lines.push(`- **부품명**: ${part.name}`);
  lines.push(`- **카테고리**: ${CATEGORY_KOREAN[part.category] || part.category}`);
  lines.push(`- **제조사**: ${part.manufacturer}`);
  lines.push(`- **모델**: ${part.model}`);
  lines.push(`- **상태**: ${part.condition === 'excellent' ? '최상' : part.condition === 'good' ? '양호' : '보통'}`);
  lines.push(`- **가격**: ${part.price?.toLocaleString()}원`);
  lines.push(`- **수량**: ${part.quantity}개`);
  lines.push('');

  // Battery-specific info
  if (part.batteryHealth) {
    lines.push(`## 배터리 상태`);
    lines.push(`- **SOH (State of Health)**: ${part.batteryHealth.soh}%`);
    if (part.batteryHealth.cathodeType) {
      lines.push(`- **양극재 타입**: ${part.batteryHealth.cathodeType}`);
    }
    if (part.batteryHealth.cycles) {
      lines.push(`- **충방전 횟수**: ${part.batteryHealth.cycles}회`);
    }
    if (part.batteryHealth.predictedRange) {
      lines.push(`- **예상 주행거리**: ${part.batteryHealth.predictedRange}km`);
    }

    // Reuse recommendation
    if (part.batteryHealth.soh >= 70) {
      lines.push('');
      lines.push('> **권장 용도**: 전기차 재사용 적합. SOH가 70% 이상으로 충분한 성능을 제공합니다.');
    } else if (part.batteryHealth.soh >= 50) {
      lines.push('');
      lines.push('> **권장 용도**: ESS(에너지 저장 시스템) 전환 권장. 전기차 직접 사용보다는 정치형 저장장치로 활용 시 경제적입니다.');
    } else {
      lines.push('');
      lines.push('> **권장 용도**: 재활용 권장. 배터리 재활용 업체를 통해 원자재 회수를 권장합니다.');
    }
    lines.push('');
  }

  // Specifications
  if (part.specifications) {
    const spec = part.specifications;

    if (spec.electricalProps) {
      lines.push(`## 전기적 특성`);
      lines.push(`- **전압**: ${spec.electricalProps.voltage}V`);
      lines.push(`- **용량**: ${spec.electricalProps.capacity}Ah`);
      if (spec.electricalProps.power) {
        lines.push(`- **출력**: ${spec.electricalProps.power}kW`);
      }
      lines.push('');
    }

    if (spec.materialComposition) {
      lines.push(`## 재질 정보`);
      if (spec.materialComposition.primary) {
        lines.push(`- **주요 재질**: ${spec.materialComposition.primary}`);
      }
      if (spec.materialComposition.alloyNumber) {
        lines.push(`- **합금 번호**: ${spec.materialComposition.alloyNumber}`);
      }
      if (spec.materialComposition.tensileStrength) {
        lines.push(`- **인장강도**: ${spec.materialComposition.tensileStrength}MPa`);
      }
      if (spec.materialComposition.recyclability) {
        lines.push(`- **재활용률**: ${spec.materialComposition.recyclability}%`);
      }
      lines.push('');
    }

    if (spec.dimensions) {
      lines.push(`## 치수 정보`);
      const dim = spec.dimensions;
      if (dim.length && dim.width && dim.height) {
        lines.push(`- **크기**: ${dim.length} x ${dim.width} x ${dim.height} mm`);
      }
      if (dim.weight) {
        lines.push(`- **중량**: ${dim.weight}kg`);
      }
      lines.push('');
    }
  }

  // Description
  if (part.description) {
    lines.push(`## 상세 설명`);
    lines.push(part.description);
    lines.push('');
  }

  // Keywords for better retrieval
  const keywords = generateKeywords(part);
  if (keywords.length > 0) {
    lines.push(`## 관련 키워드`);
    lines.push(keywords.join(', '));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate keywords for improved retrieval
 */
function generateKeywords(part: any): string[] {
  const keywords: string[] = [];

  // Category-based
  if (part.category?.includes('battery')) {
    keywords.push('배터리', '리튬이온', '에너지저장', 'BMS', '셀팩', '전기차배터리');
  } else if (part.category?.includes('motor')) {
    keywords.push('모터', '구동모터', '전동기', 'PMSM', '토크', '회전');
  } else if (part.category?.includes('inverter')) {
    keywords.push('인버터', 'DC-AC', '전력변환', 'IGBT', '컨버터', '전력전자');
  } else if (part.category?.includes('body')) {
    keywords.push('바디', '차체', '외장', '알루미늄', '패널', '프레임');
  }

  // Manufacturer
  if (part.manufacturer) {
    keywords.push(part.manufacturer);
  }

  // Condition
  if (part.condition === 'excellent') {
    keywords.push('최상급', '프리미엄', '신품급');
  }

  // Battery SOH
  if (part.batteryHealth?.soh) {
    if (part.batteryHealth.soh >= 80) {
      keywords.push('고SOH', '재사용가능');
    } else if (part.batteryHealth.soh >= 60) {
      keywords.push('ESS전환', '에너지저장');
    }
  }

  return [...new Set(keywords)];
}

/**
 * Convert part to KB document
 */
function convertToKBDocument(part: any): KBDocument {
  const partId = part.PK.split('#')[1];

  return {
    partId,
    title: part.name,
    content: generateContent(part),
    metadata: {
      category: part.category,
      categoryKorean: CATEGORY_KOREAN[part.category] || part.category,
      manufacturer: part.manufacturer,
      price: part.price || 0,
      condition: part.condition || 'unknown',
      soh: part.batteryHealth?.soh,
    },
  };
}

/**
 * Upload document to S3
 */
async function uploadDocument(doc: KBDocument): Promise<void> {
  const key = `${KB_PREFIX}/${doc.metadata.category}/${doc.partId}.json`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: TARGET_BUCKET,
      Key: key,
      Body: JSON.stringify(doc, null, 2),
      ContentType: 'application/json',
    })
  );
}

/**
 * Main function
 */
async function main() {
  console.log('=== Bedrock Knowledge Base Document Preparation ===\n');
  console.log('Configuration:');
  console.log(`  DynamoDB Table: ${DYNAMODB_TABLE}`);
  console.log(`  Target Bucket: ${TARGET_BUCKET}`);
  console.log(`  KB Prefix: ${KB_PREFIX}\n`);

  // Step 1: Scan all parts
  console.log('Step 1: Scanning parts from DynamoDB...');
  const parts = await scanAllParts();
  console.log(`Found ${parts.length} parts\n`);

  if (parts.length === 0) {
    console.log('No parts found. Exiting.');
    return;
  }

  // Step 2: Convert to KB documents
  console.log('Step 2: Converting to KB documents...');
  const documents = parts.map(convertToKBDocument);

  // Group by category for stats
  const byCategory = documents.reduce((acc, doc) => {
    acc[doc.metadata.category] = (acc[doc.metadata.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Documents by category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  console.log('');

  // Step 3: Upload to S3
  console.log('Step 3: Uploading documents to S3...');
  let uploaded = 0;
  for (const doc of documents) {
    try {
      await uploadDocument(doc);
      uploaded++;
      if (uploaded % 10 === 0) {
        console.log(`  Uploaded ${uploaded}/${documents.length} documents`);
      }
    } catch (error) {
      console.error(`Failed to upload ${doc.partId}:`, error);
    }
  }

  console.log(`\nUpload complete! ${uploaded}/${documents.length} documents uploaded.`);

  // Step 4: Print sample document
  if (documents.length > 0) {
    console.log('\n=== Sample Document ===');
    console.log(JSON.stringify(documents[0], null, 2));
  }

  // Step 5: Print next steps
  console.log('\n=== Next Steps ===');
  console.log('1. Go to AWS Console > Amazon Bedrock > Knowledge Bases');
  console.log('2. Create new Knowledge Base');
  console.log(`3. Data source: s3://${TARGET_BUCKET}/${KB_PREFIX}/`);
  console.log('4. Vector store: Select S3 Vectors (recommended for cost)');
  console.log('5. Embedding model: Titan Embeddings G2 (v2)');
  console.log('6. Chunking strategy: Fixed size (300 tokens, 20% overlap)');
  console.log('7. Sync the Knowledge Base');
  console.log('8. Copy Knowledge Base ID to SAM template');
}

// Run
main().catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});
