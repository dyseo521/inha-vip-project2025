/**
 * App Mention 핸들러
 * @자동이 멘션 처리 (자연어 대화)
 */

import { SlackEvent, SlackBlock, AgentStep } from '../types.js';
import { getBotToken } from '../slack-verifier.js';
import { runReActAgent } from '../orchestrator.js';

/**
 * @자동이 멘션 처리
 */
export async function handleAppMention(event: SlackEvent): Promise<void> {
  const eventPayload = event.event;
  if (!eventPayload) {
    console.error('No event payload');
    return;
  }

  const { user, text, channel, thread_ts, ts } = eventPayload;

  // @자동이 멘션 제거
  const userMessage = text.replace(/<@[A-Z0-9]+>/g, '').trim();

  console.log('App mention:', { user, userMessage, channel, thread_ts });

  // 빈 메시지 처리
  if (!userMessage) {
    await postMessage(
      channel,
      '안녕하세요! 자동이입니다. 무엇을 도와드릴까요?\n\n' +
        '• *에러 분석*: `@자동이 VectorSearch 함수에서 에러가 발생해요`\n' +
        '• *로그 조회*: `@자동이 GetParts 함수 로그 보여줘`\n' +
        '• *상태 확인*: `@자동이 Lambda 함수 상태 알려줘`\n' +
        '• *해결 사례*: `@자동이 Throttling 에러 어떻게 해결했어?`',
      thread_ts || ts
    );
    return;
  }

  try {
    // 타이핑 표시 (사용자 경험 향상)
    await postTypingIndicator(channel, thread_ts || ts);

    // ReAct 에이전트로 처리
    const result = await runReActAgent(userMessage, {
      userId: user,
      channelId: channel,
      threadTs: thread_ts || ts,
    });

    // 결과를 Slack으로 전송
    await postMessage(channel, result.response, thread_ts || ts, result.steps);
  } catch (error) {
    console.error('Error handling app mention:', error);
    await postErrorMessage(channel, thread_ts || ts);
  }
}

/**
 * Slack에 메시지 전송 (chat.postMessage)
 */
async function postMessage(
  channel: string,
  message: string,
  threadTs?: string,
  steps?: AgentStep[]
): Promise<void> {
  const botToken = await getBotToken();

  const blocks: SlackBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message,
      },
    },
  ];

  // 에이전트 사고 과정 표시 (선택적)
  if (steps && steps.length > 0 && process.env.SHOW_AGENT_THOUGHTS === 'true') {
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            '*🧠 사고 과정:*\n' +
            steps
              .map(
                (s) =>
                  `• ${s.thought}${s.action ? ` → ${s.action}` : ''}`
              )
              .join('\n'),
        },
      ],
    });
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify({
      channel,
      blocks,
      text: message, // fallback
      thread_ts: threadTs,
    }),
  });

  const result = (await response.json()) as { ok: boolean; error?: string };
  if (!result.ok) {
    console.error('Failed to post message:', result.error);
  }
}

/**
 * 타이핑 표시 (reaction 추가)
 */
async function postTypingIndicator(
  channel: string,
  timestamp: string
): Promise<void> {
  const botToken = await getBotToken();

  try {
    // 로봇 이모지로 처리 중 표시
    await fetch('https://slack.com/api/reactions.add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel,
        timestamp,
        name: 'robot_face',
      }),
    });
  } catch (error) {
    // 리액션 실패는 무시
    console.log('Typing indicator failed (non-critical)');
  }
}

/**
 * 에러 메시지 전송
 */
async function postErrorMessage(
  channel: string,
  threadTs?: string
): Promise<void> {
  const botToken = await getBotToken();

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify({
      channel,
      text: '죄송합니다, 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 🙇',
      thread_ts: threadTs,
    }),
  });
}
