# CodeForce - AI 기반 JIRA-GitHub 워크플로우 자동화 시스템

## 프로젝트 개요

CodeForce는 JIRA에서 작업 계획을 세우면 AI 에이전트가 자동으로 PR을 생성하고, PR 코멘트 시 AI가 자동으로 업데이트하는 지능형 워크플로우 시스템입니다.

## 주요 기능

- **JIRA 웹훅 연동**: 이슈 생성, 수정, 코멘트 이벤트 처리
- **GitHub 웹훅 연동**: PR 생성, 리뷰, 코멘트 이벤트 처리
- **이벤트 큐 시스템**: Bull을 사용한 비동기 이벤트 처리
- **보안 검증**: 웹훅 서명 검증을 통한 보안 강화
- **로깅 시스템**: Winston을 사용한 구조화된 로깅

## 기술 스택

- **Backend**: Node.js + Express
- **Queue System**: Bull + Redis
- **Logging**: Winston
- **Security**: Helmet, CORS
- **API Integration**: JIRA API, GitHub API

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값들을 설정하세요:

```bash
cp env.example .env
```

#### 필수 환경 변수

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JIRA Configuration
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_USERNAME=your-jira-username
JIRA_API_TOKEN=your-jira-api-token
JIRA_WEBHOOK_SECRET=your-jira-webhook-secret

# GitHub Configuration
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_WEBHOOK_SECRET=your-github-webhook-secret

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

### 3. Redis 설치 및 실행

#### macOS (Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 4. 서버 실행

#### 개발 모드
```bash
npm run dev
```

#### 프로덕션 모드
```bash
npm start
```

## API 엔드포인트

### 헬스체크
- `GET /health` - 기본 헬스체크
- `GET /health/detailed` - 상세 헬스체크

### 웹훅 엔드포인트
- `POST /webhook/jira` - JIRA 웹훅 수신
- `POST /webhook/github` - GitHub 웹훅 수신
- `POST /webhook/test` - 테스트 웹훅

## 웹훅 설정

### JIRA 웹훅 설정

1. JIRA 관리자 페이지에서 웹훅 생성
2. URL: `https://zipte.atlassian.net/plugins/servlet/webhooks` 로 이동해서 웹훅 생성

3. 이벤트 선택:
   - Issue created
   - Issue updated
   - Issue deleted
   - Comment created
   - Comment updated
   - Comment deleted

### GitHub 웹훅 설정

1. GitHub 레포지토리 설정에서 웹훅 생성
2. URL: `https://your-domain.com/webhook/github`
3. 이벤트 선택:
   - Push
   - Pull requests
   - Issues
   - Issue comments
   - Pull request reviews

## 테스트

### 웹훅 테스트

```bash
# 테스트 웹훅 전송
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "timestamp": "2024-01-01T00:00:00Z"}'
```

### JIRA 웹훅 테스트

```bash
# JIRA 웹훅 시뮬레이션
curl -X POST http://localhost:3000/webhook/jira \
  -H "Content-Type: application/json" \
  -H "x-atlassian-webhook-event: jira:issue_created" \
  -H "x-hub-signature: sha256=your-signature" \
  -d '{
    "timestamp": 1640995200000,
    "issue": {
      "key": "TEST-123",
      "id": "12345",
      "fields": {
        "summary": "Test Issue",
        "description": "This is a test issue",
        "issuetype": {"name": "Task"},
        "project": {"key": "TEST", "name": "Test Project"},
        "priority": {"name": "Medium"},
        "labels": ["test", "automation"]
      }
    }
  }'
```

### GitHub 웹훅 테스트

```bash
# GitHub 웹훅 시뮬레이션
curl -X POST http://localhost:3000/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -H "x-hub-signature-256: sha256=your-signature" \
  -d '{
    "ref": "refs/heads/main",
    "before": "abc123",
    "after": "def456",
    "repository": {
      "full_name": "test/repo",
      "id": 12345
    },
    "sender": {
      "login": "testuser"
    },
    "commits": [
      {
        "id": "def456",
        "message": "Test commit",
        "author": {"name": "Test User"},
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }'
```

## 로그 확인

로그 파일은 `logs/` 디렉토리에 저장됩니다:
- `logs/combined.log` - 모든 로그
- `logs/error.log` - 에러 로그만

## 큐 모니터링

Bull 큐의 상태를 확인하려면:

```javascript
const eventQueue = require('./src/services/eventQueue');

// 큐 통계 확인
const stats = await eventQueue.getStats();
console.log(stats);
```

## 개발 가이드

### 새로운 웹훅 이벤트 추가

1. `src/controllers/` 디렉토리에 새로운 컨트롤러 생성
2. `src/routes/webhooks.js`에 라우트 추가
3. `src/middleware/webhookValidation.js`에 검증 로직 추가
4. `src/services/eventQueue.js`에 큐 처리 로직 추가

### 새로운 서비스 추가

1. `src/services/` 디렉토리에 서비스 파일 생성
2. 필요한 API 클라이언트 및 메서드 구현
3. 에러 처리 및 로깅 추가

## 문제 해결

### Redis 연결 오류
- Redis 서버가 실행 중인지 확인
- `REDIS_URL` 환경 변수가 올바른지 확인

### 웹훅 검증 실패
- 웹훅 시크릿이 올바르게 설정되었는지 확인
- 서명 생성 로직이 올바른지 확인

### API 연동 오류
- API 토큰이 유효한지 확인
- API 권한이 충분한지 확인

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 