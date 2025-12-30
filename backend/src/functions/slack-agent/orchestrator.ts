/**
 * ReAct 에이전트 오케스트레이터
 * Thought → Action → Observation 루프
 */

import {
  BedrockRuntimeClient,
  ConverseCommand,
  ContentBlock,
  Message,
  ToolUseBlock,
  ToolResultBlock,
  Tool as BedrockTool,
} from '@aws-sdk/client-bedrock-runtime';
import { AgentStep } from './types.js';
import { JADONG_SYSTEM_PROMPT } from './prompts/system.js';
import { TOOLS, executeTool } from './tools/index.js';

const bedrockClient = new BedrockRuntimeClient({ region: 'ap-northeast-2' });

// Haiku 기본, 복잡한 분석은 Sonnet
const HAIKU_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';
const SONNET_MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

const MAX_TURNS = 10; // 최대 에이전트 턴 수

interface AgentContext {
  userId: string;
  channelId: string;
  threadTs?: string;
}

interface AgentResult {
  response: string;
  steps: AgentStep[];
}

/**
 * ReAct 에이전트 실행
 */
export async function runReActAgent(
  userMessage: string,
  context: AgentContext
): Promise<AgentResult> {
  console.log('Starting ReAct agent:', { userMessage, context });

  const steps: AgentStep[] = [];
  const messages: Message[] = [];

  // 초기 사용자 메시지
  messages.push({
    role: 'user',
    content: [{ text: userMessage }],
  });

  let turnCount = 0;
  let finalResponse = '';

  // Bedrock Converse API용 도구 정의
  const tools = TOOLS.map((tool) => ({
    toolSpec: {
      name: tool.name,
      description: tool.description,
      inputSchema: {
        json: tool.input_schema as Record<string, unknown>,
      },
    },
  })) as BedrockTool[];

  while (turnCount < MAX_TURNS) {
    turnCount++;
    console.log(`Agent turn ${turnCount}/${MAX_TURNS}`);

    try {
      // Claude 호출 (Tool Use)
      const response = await bedrockClient.send(
        new ConverseCommand({
          modelId: selectModel(userMessage, turnCount),
          system: [{ text: JADONG_SYSTEM_PROMPT }],
          messages,
          toolConfig: {
            tools,
          },
          inferenceConfig: {
            maxTokens: 2048,
            temperature: 0.5,
          },
        })
      );

      const assistantMessage = response.output?.message;
      if (!assistantMessage?.content) {
        console.error('No content in response');
        break;
      }

      // 대화 기록에 추가
      messages.push(assistantMessage);

      // 응답 처리
      const { hasToolUse, textResponse, toolUses } = parseResponse(
        assistantMessage.content as ContentBlock[]
      );

      // Tool 호출이 있으면 실행
      if (hasToolUse && toolUses.length > 0) {
        const toolResults: ToolResultBlock[] = [];

        for (const toolUse of toolUses) {
          console.log('Tool call:', toolUse.name, toolUse.input);

          // 스텝 기록
          steps.push({
            thought: textResponse || `${toolUse.name} 호출`,
            action: toolUse.name,
            actionInput: toolUse.input as Record<string, unknown>,
          });

          // 도구 실행
          const result = await executeTool(
            toolUse.name!,
            toolUse.input as Record<string, unknown>
          );

          // 결과 기록
          steps[steps.length - 1].observation = result.success
            ? JSON.stringify(result.data).slice(0, 500)
            : result.error;

          toolResults.push({
            toolUseId: toolUse.toolUseId!,
            content: [
              {
                text: result.success
                  ? JSON.stringify(result.data)
                  : `Error: ${result.error}`,
              },
            ],
          });
        }

        // 도구 결과를 대화에 추가
        messages.push({
          role: 'user',
          content: toolResults.map((tr) => ({
            toolResult: tr,
          })),
        });

        // 다음 턴으로 계속
        continue;
      }

      // Tool 호출 없음 = 최종 응답
      if (textResponse) {
        finalResponse = textResponse;
        steps.push({
          thought: '최종 답변 완료',
        });
        break;
      }

      // 응답이 비었으면 종료
      break;
    } catch (error) {
      console.error('Agent error:', error);
      finalResponse = '죄송합니다, 처리 중 오류가 발생했습니다.';
      break;
    }
  }

  // 최대 턴 도달
  if (turnCount >= MAX_TURNS && !finalResponse) {
    finalResponse =
      '분석이 복잡하여 완료하지 못했습니다. 더 구체적인 질문을 해주시면 도움이 됩니다.';
  }

  console.log('Agent completed:', { turns: turnCount, stepsCount: steps.length });

  return {
    response: finalResponse,
    steps,
  };
}

/**
 * 모델 선택 (비용 최적화)
 */
function selectModel(message: string, turnCount: number): string {
  // 복잡한 분석이 필요한 경우 Sonnet 사용
  const complexPatterns = [
    /분석해/,
    /왜.*그런/,
    /원인.*뭐/,
    /해결.*방법/,
    /설명해/,
  ];

  const isComplex = complexPatterns.some((p) => p.test(message));

  // 첫 번째 턴에서 복잡한 질문이면 Sonnet
  if (turnCount === 1 && isComplex) {
    console.log('Using Sonnet for complex analysis');
    return SONNET_MODEL_ID;
  }

  // 기본은 Haiku (비용 1/12)
  return HAIKU_MODEL_ID;
}

/**
 * 응답 파싱
 */
function parseResponse(content: ContentBlock[]): {
  hasToolUse: boolean;
  textResponse: string;
  toolUses: ToolUseBlock[];
} {
  let textResponse = '';
  const toolUses: ToolUseBlock[] = [];

  for (const block of content) {
    if ('text' in block && block.text) {
      textResponse += block.text;
    }
    if ('toolUse' in block && block.toolUse) {
      toolUses.push(block.toolUse as ToolUseBlock);
    }
  }

  return {
    hasToolUse: toolUses.length > 0,
    textResponse: textResponse.trim(),
    toolUses,
  };
}

/**
 * 간단한 질문 처리 (에이전트 없이)
 */
export async function handleSimpleQuery(message: string): Promise<string> {
  // 인사, 감사 등 간단한 응답
  const greetings: Record<string, string> = {
    안녕: '안녕하세요! 자동이입니다. 무엇을 도와드릴까요? 😊',
    고마워: '도움이 되었다니 기쁩니다! 또 필요하시면 말씀해주세요. 😊',
    수고해: '감사합니다! 언제든 불러주세요. 💪',
  };

  for (const [key, response] of Object.entries(greetings)) {
    if (message.includes(key)) {
      return response;
    }
  }

  // 매칭되지 않으면 null 반환 (에이전트 사용)
  return '';
}
