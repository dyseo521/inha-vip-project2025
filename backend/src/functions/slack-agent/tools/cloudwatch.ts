/**
 * CloudWatch 로그/메트릭 조회 도구
 */

import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
  StartQueryCommand,
  GetQueryResultsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from '@aws-sdk/client-cloudwatch';
import { LambdaStatus, LogEntry } from '../types.js';

const logsClient = new CloudWatchLogsClient({ region: 'ap-northeast-2' });
const cwClient = new CloudWatchClient({ region: 'ap-northeast-2' });

// Lambda 함수 이름 접두사 (SAM 스택 이름)
const STACK_PREFIX = process.env.STACK_NAME || 'eecar-stack';

/**
 * Lambda 함수 상태 조회
 */
export async function getLambdaStatus(functionName: string): Promise<LambdaStatus> {
  const fullFunctionName = `${STACK_PREFIX}-${functionName}`;
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 1시간 전

  try {
    // 호출 횟수
    const invocationsResult = await cwClient.send(
      new GetMetricStatisticsCommand({
        Namespace: 'AWS/Lambda',
        MetricName: 'Invocations',
        Dimensions: [{ Name: 'FunctionName', Value: fullFunctionName }],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Sum'],
      })
    );

    // 에러 횟수
    const errorsResult = await cwClient.send(
      new GetMetricStatisticsCommand({
        Namespace: 'AWS/Lambda',
        MetricName: 'Errors',
        Dimensions: [{ Name: 'FunctionName', Value: fullFunctionName }],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Sum'],
      })
    );

    // 평균 실행 시간
    const durationResult = await cwClient.send(
      new GetMetricStatisticsCommand({
        Namespace: 'AWS/Lambda',
        MetricName: 'Duration',
        Dimensions: [{ Name: 'FunctionName', Value: fullFunctionName }],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Average'],
      })
    );

    const invocations =
      invocationsResult.Datapoints?.[0]?.Sum || 0;
    const errors = errorsResult.Datapoints?.[0]?.Sum || 0;
    const avgDuration =
      durationResult.Datapoints?.[0]?.Average || 0;

    // 마지막 에러 메시지 조회
    let lastError: { message: string; timestamp: string } | undefined;
    if (errors > 0) {
      const recentLogs = await getRecentLogs(functionName, 30, 'ERROR');
      if (recentLogs.length > 0) {
        lastError = {
          message: recentLogs[0].message,
          timestamp: recentLogs[0].timestamp,
        };
      }
    }

    return {
      functionName,
      invocations,
      errors,
      errorRate: invocations > 0 ? (errors / invocations) * 100 : 0,
      avgDuration,
      lastError,
    };
  } catch (error) {
    console.error(`Error getting status for ${functionName}:`, error);
    return {
      functionName,
      invocations: 0,
      errors: 0,
      errorRate: 0,
      avgDuration: 0,
    };
  }
}

/**
 * 최근 로그 조회
 */
export async function getRecentLogs(
  functionName: string,
  minutes: number = 30,
  filter: 'ERROR' | 'WARN' | 'INFO' | 'ALL' = 'ERROR'
): Promise<LogEntry[]> {
  const fullFunctionName = `${STACK_PREFIX}-${functionName}`;
  const logGroupName = `/aws/lambda/${fullFunctionName}`;
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - minutes * 60 * 1000);

  // 필터 패턴
  const filterPatterns: Record<string, string> = {
    ERROR: '?ERROR ?Error ?error ?Exception ?exception ?FATAL',
    WARN: '?WARN ?warn ?WARNING ?warning',
    INFO: '?INFO ?info',
    ALL: '',
  };

  try {
    const result = await logsClient.send(
      new FilterLogEventsCommand({
        logGroupName,
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        filterPattern: filterPatterns[filter],
        limit: 50,
      })
    );

    return (result.events || []).map((event) => ({
      timestamp: new Date(event.timestamp || 0).toISOString(),
      message: event.message || '',
      requestId: extractRequestId(event.message || ''),
      level: detectLogLevel(event.message || ''),
    }));
  } catch (error) {
    console.error(`Error getting logs for ${functionName}:`, error);
    return [];
  }
}

/**
 * Logs Insights 쿼리 실행
 */
export async function queryLogs(
  functionName: string,
  query: string,
  minutes: number = 60
): Promise<Record<string, unknown>[]> {
  const fullFunctionName = `${STACK_PREFIX}-${functionName}`;
  const logGroupName = `/aws/lambda/${fullFunctionName}`;
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - minutes * 60 * 1000);

  try {
    // 쿼리 시작
    const startResult = await logsClient.send(
      new StartQueryCommand({
        logGroupName,
        startTime: Math.floor(startTime.getTime() / 1000),
        endTime: Math.floor(endTime.getTime() / 1000),
        queryString: query,
      })
    );

    if (!startResult.queryId) {
      return [];
    }

    // 쿼리 결과 대기 (최대 10초)
    let attempts = 0;
    while (attempts < 10) {
      await sleep(1000);
      attempts++;

      const result = await logsClient.send(
        new GetQueryResultsCommand({
          queryId: startResult.queryId,
        })
      );

      if (result.status === 'Complete') {
        return (result.results || []).map((row) => {
          const obj: Record<string, unknown> = {};
          row.forEach((field) => {
            if (field.field && field.value) {
              obj[field.field] = field.value;
            }
          });
          return obj;
        });
      }

      if (result.status === 'Failed' || result.status === 'Cancelled') {
        console.error('Query failed:', result.status);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error('Error querying logs:', error);
    return [];
  }
}

/**
 * 에러 요약 조회
 */
export async function getErrorSummary(
  functionName: string,
  hours: number = 24
): Promise<{ errorType: string; count: number; lastOccurred: string }[]> {
  const query = `
    fields @timestamp, @message
    | filter @message like /(?i)error|exception/
    | parse @message /(?<errorType>[A-Za-z]+Exception|[A-Za-z]+Error)/
    | stats count(*) as count, max(@timestamp) as lastOccurred by errorType
    | sort count desc
    | limit 10
  `;

  const results = await queryLogs(functionName, query, hours * 60);

  return results.map((r) => ({
    errorType: String(r.errorType || 'Unknown'),
    count: Number(r.count) || 0,
    lastOccurred: String(r.lastOccurred || ''),
  }));
}

/**
 * 요청 ID 추출
 */
function extractRequestId(message: string): string | undefined {
  // Lambda RequestId 형식: RequestId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const match = message.match(
    /RequestId:\s*([a-f0-9-]{36})/i
  );
  return match?.[1];
}

/**
 * 로그 레벨 감지
 */
function detectLogLevel(message: string): 'ERROR' | 'WARN' | 'INFO' {
  if (/error|exception|fatal/i.test(message)) return 'ERROR';
  if (/warn/i.test(message)) return 'WARN';
  return 'INFO';
}

/**
 * sleep 유틸
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
