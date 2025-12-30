# 자동이 2.0 설정 가이드

## 개요

자동이 2.0은 AI DevOps 어시스턴트로, Slack을 통해 Lambda 에러 분석, 로그 조회, 과거 해결 사례 검색 기능을 제공합니다.

### 아키텍처
```
Slack → API Gateway → SlackAgentFunction (Lambda)
                            ↓
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
    CloudWatch         Bedrock KB         S3 Vectors
    (로그/메트릭)    (코드베이스 검색)    (장기 기억)
```

### 사용 기술
- **S3 Vectors**: 벡터 저장 (비용 90% 절감)
- **Bedrock KB + S3 Vectors**: 코드베이스 RAG 검색
- **Bedrock Claude**: AI 에러 분석 (Haiku 기본, Sonnet 복잡한 분석)
- **Titan Embeddings v2**: 1024 차원 임베딩

---

## 1. Bedrock Knowledge Base 설정 (S3 Vectors 연동)

### 1.1 AWS Console에서 Knowledge Base 생성

1. **AWS Console** → **Amazon Bedrock** → **Knowledge bases** 이동
2. **Create knowledge base** 클릭

### 1.2 Knowledge Base 설정

| 항목 | 값 |
|------|-----|
| Name | `eecar-codebase-kb` |
| Description | EECAR 프로젝트 코드베이스 Knowledge Base |
| IAM Role | Create and use a new service role |

### 1.3 Data Source 설정

| 항목 | 값 |
|------|-----|
| Data source name | `eecar-codebase-source` |
| S3 URI | `s3://eecar-documents-425454508084/knowledge-base/codebase/` |

### 1.4 Embeddings Model 선택

| 항목 | 값 |
|------|-----|
| Embeddings model | **Titan Text Embeddings V2** |
| Vector dimensions | 1024 |

### 1.5 Vector Database 설정 (S3 Vectors 선택!)

| 항목 | 값 |
|------|-----|
| Vector database | **S3 vector bucket** |
| S3 vector bucket | `eecar-vectors-index-12234628` |
| Vector index | `eecar-codebase` (이미 생성됨) |

### 1.6 생성 완료 후

1. **Sync** 버튼 클릭하여 문서 인덱싱
2. Knowledge Base ID 복사 (예: `XXXXXXXXXX`)
3. 환경 변수에 설정

```bash
# SSM Parameter로 저장
aws ssm put-parameter \
  --name "/eecar/bedrock/kb-id" \
  --value "YOUR_KB_ID" \
  --type "String" \
  --overwrite
```

---

## 2. Slack App 설정

### 2.1 Slack App 생성

1. https://api.slack.com/apps 접속
2. **Create New App** → **From scratch**
3. App Name: `자동이 2.0`
4. Workspace 선택

### 2.2 Bot Token Scopes 설정

**OAuth & Permissions** → **Bot Token Scopes**에 추가:

```
app_mentions:read     # @자동이 멘션 읽기
channels:history      # 채널 메시지 읽기
channels:read         # 채널 정보 읽기
chat:write            # 메시지 전송
commands              # Slash Commands
reactions:write       # 리액션 추가
```

### 2.3 Slash Command 등록

**Slash Commands** → **Create New Command**:

| Command | Request URL | Description |
|---------|-------------|-------------|
| `/자동이` | `https://YOUR_API_GATEWAY/prod/api/slack/events` | 자동이 명령어 |

### 2.4 Event Subscriptions 설정

**Event Subscriptions** → **Enable Events**

| 항목 | 값 |
|------|-----|
| Request URL | `https://YOUR_API_GATEWAY/prod/api/slack/events` |

**Subscribe to bot events**:
- `app_mention`
- `message.channels`

### 2.5 Interactivity 설정

**Interactivity & Shortcuts** → **On**

| 항목 | 값 |
|------|-----|
| Request URL | `https://YOUR_API_GATEWAY/prod/api/slack/events` |

### 2.6 토큰 저장

**OAuth & Permissions**에서 토큰 복사:

```bash
# Bot Token 저장
aws ssm put-parameter \
  --name "/eecar/slack/bot-token" \
  --value "xoxb-YOUR-BOT-TOKEN" \
  --type "SecureString" \
  --overwrite

# Signing Secret 저장 (Basic Information에서 확인)
aws ssm put-parameter \
  --name "/eecar/slack/signing-secret" \
  --value "YOUR-SIGNING-SECRET" \
  --type "SecureString" \
  --overwrite
```

### 2.7 App 설치

**Install App** → **Install to Workspace**

---

## 3. SAM 배포

```bash
# 빌드
cd backend && npm run build && cd ..

# SAM 빌드 및 배포
cd infrastructure
sam build
sam deploy

# API Gateway URL 확인
aws cloudformation describe-stacks \
  --stack-name eecar-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

---

## 4. 테스트

### Slack에서 테스트

```
/자동이 도움말          # 명령어 목록
/자동이 상태            # Lambda 함수 상태 조회
/자동이 로그 VectorSearch  # 특정 함수 로그 조회
/자동이 분석 BedrockThrottlingException  # AI 에러 분석
/자동이 기억 Throttling    # 과거 해결 사례 검색

@자동이 VectorSearch 함수에서 에러가 자주 발생해요  # 자연어 대화
```

---

## 5. 환경 변수 요약

### SSM Parameters

| Parameter | 설명 |
|-----------|------|
| `/eecar/slack/bot-token` | Slack Bot OAuth Token |
| `/eecar/slack/signing-secret` | Slack Signing Secret |
| `/eecar/bedrock/kb-id` | Bedrock Knowledge Base ID |

### Lambda 환경 변수 (template.yaml)

| 변수 | 값 |
|------|-----|
| `S3_VECTORS_BUCKET` | `eecar-vectors-index-12234628` |
| `S3_VECTORS_MEMORY_INDEX` | `jadong-memories` |
| `BEDROCK_KB_ID` | (SSM에서 가져옴) |

---

## 6. S3 Vectors 인덱스 현황

| 인덱스 | 용도 | 차원 |
|--------|------|------|
| `jadong-memories` | 에러 해결 사례 기억 | 1024 |
| `eecar-codebase` | Bedrock KB 연동 (코드베이스) | 1024 |
| `parts-vectors` | 부품 벡터 검색 | 1024 |

---

## 참고 자료

- [S3 Vectors + Bedrock KB 통합](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-bedrock-kb.html)
- [S3 Vectors JavaScript SDK](https://www.npmjs.com/package/@aws-sdk/client-s3vectors)
- [Bedrock Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)
