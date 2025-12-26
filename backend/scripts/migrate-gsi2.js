#!/usr/bin/env node

/**
 * Migration script to add GSI2 keys to existing METADATA items
 * GSI2PK = 'ALL#METADATA', GSI2SK = 'CREATED_AT#<timestamp>'
 */

import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const TABLE_NAME = process.env.PARTS_TABLE_NAME || 'eecar-parts-table';
const REGION = 'ap-northeast-2';

const dynamoClient = new DynamoDBClient({ region: REGION });

async function main() {
  console.log('======================================================================');
  console.log('GSI2 마이그레이션 스크립트');
  console.log('======================================================================\n');
  console.log(`타겟 테이블: ${TABLE_NAME}\n`);

  // Step 1: Scan for all METADATA items
  console.log('Step 1: 모든 METADATA 아이템 스캔 중...\n');

  let items = [];
  let lastKey = undefined;

  do {
    const scanResponse = await dynamoClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'SK = :sk',
      ExpressionAttributeValues: marshall({ ':sk': 'METADATA' }),
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }));

    items = items.concat((scanResponse.Items || []).map(item => unmarshall(item)));
    lastKey = scanResponse.LastEvaluatedKey;
  } while (lastKey);

  console.log(`총 ${items.length}개 METADATA 아이템 발견\n`);

  // Step 2: Filter items that need migration (no GSI2PK)
  const itemsToMigrate = items.filter(item => !item.GSI2PK);
  console.log(`마이그레이션 필요: ${itemsToMigrate.length}개\n`);

  if (itemsToMigrate.length === 0) {
    console.log('마이그레이션할 아이템이 없습니다. 종료합니다.');
    return;
  }

  // Step 3: Update items with GSI2 keys
  console.log('Step 2: GSI2 키 추가 중...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < itemsToMigrate.length; i++) {
    const item = itemsToMigrate[i];
    const partId = item.PK.split('#')[1];

    try {
      // Use createdAt if available, otherwise use current timestamp
      const timestamp = item.createdAt || new Date().toISOString();

      await dynamoClient.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({
          PK: item.PK,
          SK: item.SK,
        }),
        UpdateExpression: 'SET GSI2PK = :gsi2pk, GSI2SK = :gsi2sk',
        ExpressionAttributeValues: marshall({
          ':gsi2pk': 'ALL#METADATA',
          ':gsi2sk': `CREATED_AT#${timestamp}`,
        }),
      }));

      console.log(`[${i + 1}/${itemsToMigrate.length}] ✓ ${partId} 마이그레이션 완료`);
      successCount++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
      console.error(`[${i + 1}/${itemsToMigrate.length}] ❌ ${partId} 실패:`, error.message);
      failCount++;
    }
  }

  // Summary
  console.log('\n======================================================================');
  console.log('마이그레이션 완료');
  console.log('======================================================================\n');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개\n`);

  if (successCount > 0) {
    console.log('🎉 GSI2 마이그레이션이 완료되었습니다!');
    console.log('이제 전체 카테고리 조회가 정상 작동할 것입니다.\n');
  }
}

// Run
main().catch(error => {
  console.error('치명적 오류:', error);
  process.exit(1);
});
