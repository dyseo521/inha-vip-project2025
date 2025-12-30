/**
 * Slack 요청 검증 (HMAC-SHA256)
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ region: 'ap-northeast-2' });
let cachedSigningSecret: string | null = null;

/**
 * SSM에서 Slack Signing Secret 가져오기
 */
async function getSigningSecret(): Promise<string> {
  if (cachedSigningSecret) {
    return cachedSigningSecret;
  }

  const paramName = process.env.SLACK_SIGNING_SECRET_SSM_PARAM || '/eecar/slack/signing-secret';

  try {
    const response = await ssmClient.send(
      new GetParameterCommand({
        Name: paramName,
        WithDecryption: true,
      })
    );

    cachedSigningSecret = response.Parameter?.Value || '';
    return cachedSigningSecret;
  } catch (error) {
    console.error('Failed to get signing secret from SSM:', error);
    throw new Error('Failed to retrieve Slack signing secret');
  }
}

/**
 * Slack 요청 서명 검증
 */
export async function verifySlackRequest(
  body: string,
  timestamp: string | undefined,
  signature: string | undefined
): Promise<boolean> {
  // 개발 환경에서는 검증 스킵 (선택적)
  if (process.env.SKIP_SLACK_VERIFICATION === 'true') {
    console.warn('Skipping Slack verification (dev mode)');
    return true;
  }

  if (!timestamp || !signature) {
    console.error('Missing timestamp or signature');
    return false;
  }

  // 5분 이상 오래된 요청은 거부 (리플레이 공격 방지)
  const currentTime = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp, 10);

  if (Math.abs(currentTime - requestTime) > 60 * 5) {
    console.error('Request timestamp too old:', { currentTime, requestTime });
    return false;
  }

  try {
    const signingSecret = await getSigningSecret();

    // Slack 서명 방식: v0:timestamp:body
    const baseString = `v0:${timestamp}:${body}`;
    const computedHash = createHmac('sha256', signingSecret)
      .update(baseString)
      .digest('hex');
    const computedSignature = `v0=${computedHash}`;

    // 타이밍 공격 방지를 위한 안전한 비교
    const signatureBuffer = Buffer.from(signature);
    const computedBuffer = Buffer.from(computedSignature);

    if (signatureBuffer.length !== computedBuffer.length) {
      console.error('Signature length mismatch');
      return false;
    }

    const isValid = timingSafeEqual(signatureBuffer, computedBuffer);

    if (!isValid) {
      console.error('Signature verification failed');
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying Slack request:', error);
    return false;
  }
}

/**
 * SSM에서 Slack Bot Token 가져오기
 */
let cachedBotToken: string | null = null;

export async function getBotToken(): Promise<string> {
  if (cachedBotToken) {
    return cachedBotToken;
  }

  const paramName = process.env.SLACK_BOT_TOKEN_SSM_PARAM || '/eecar/slack/bot-token';

  try {
    const response = await ssmClient.send(
      new GetParameterCommand({
        Name: paramName,
        WithDecryption: true,
      })
    );

    cachedBotToken = response.Parameter?.Value || '';
    return cachedBotToken;
  } catch (error) {
    console.error('Failed to get bot token from SSM:', error);
    throw new Error('Failed to retrieve Slack bot token');
  }
}
