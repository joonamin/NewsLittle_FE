# NewsLittle Frontend

NewsLittle의 화면을 제공하는 Next.js **Pages Router** 애플리케이션입니다. 라우트는 `src/pages`의 파일 구조로 정의합니다.

- 뉴스 수집, AI 모델 호출, 퀴즈 생성·판정, 세션 규칙은 백엔드가 담당합니다.
- 프론트엔드는 공개 백엔드 API를 브라우저에서 호출하고 화면용 View Model로 변환합니다.
- Next.js Route Handler 기반 BFF·범용 프록시는 현재 사용하지 않습니다.

## Prerequisites

- Node.js `>=20.9.0`
- npm 11+

```sh
npm install
npm run test:browser:install # 최초 1회: Playwright Chromium 설치
cp .env.example .env.local
```

## Local development

```sh
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다. 환경 변수를 바꾸면 `NEXT_PUBLIC_*` 값이 클라이언트 번들에 반영되도록 개발 서버를 다시 시작해야 합니다.

## API Model and View Model boundary

백엔드가 준비되기 전에도 화면 구현을 진행할 수 있도록 전송 데이터와 화면 데이터를 분리합니다.

| Layer | Location | Responsibility |
| --- | --- | --- |
| API Model | `src/features/contracts/api-models.ts` | 백엔드 응답과 명령 payload의 계약 후보. ISO 날짜·상태 코드·도메인 식별자를 유지합니다. |
| View Model | `src/features/contracts/view-models.ts` | 화면에 필요한 라벨, boolean, 표시 상태만 만듭니다. API Model을 그대로 노출하지 않습니다. |
| Screen API | `src/features/contracts/screen-api.ts` | `fetch` 후 API Model을 View Model로 변환하는 유일한 화면 데이터 진입점입니다. |
| Mock data | `src/mocks/fixtures.ts`, `src/mocks/handlers.ts` | API Model과 같은 응답을 MSW로 제공합니다. |

화면 컴포넌트는 API 응답을 직접 파싱하지 않고 `screenApi`가 반환하는 View Model만 사용합니다. 실제 백엔드 연동 시에도 이 규칙을 유지하면 화면 코드를 건드리지 않고 계약 변경을 한 곳에서 흡수할 수 있습니다.

### Contract-first workflow

새 화면 또는 데이터 필드가 필요하면 다음 순서로 작업합니다.

1. `api-models.ts`에 백엔드가 제공해야 할 필드 또는 명령 payload를 추가합니다.
2. `fixtures.ts`와 `handlers.ts`에 같은 계약의 성공·빈 상태·오류 상태를 정의합니다.
3. `view-models.ts`에서 화면 표시용 값으로 변환하고 unit test를 작성합니다.
4. 화면은 `screenApi`만 호출하고 View Model을 렌더링합니다.
5. 실제 백엔드가 구현되면 mock을 끈 뒤 같은 API Model을 반환하는지 통합 테스트로 확인합니다.

## MSW mock API

MSW는 브라우저의 `/api/v1/*` 요청을 가로채며, 개발·테스트에만 사용합니다. 서비스 worker는 `public/mockServiceWorker.js`이며 MSW가 생성한 파일이므로 직접 수정하지 않습니다.

### Mock 모드로 개발하기

`.env.local`을 다음처럼 설정합니다.

```dotenv
# 같은 출처의 /api/v1/* 요청을 MSW가 가로챕니다.
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_API_MOCKING=enabled
```

그 뒤 개발 서버를 다시 시작합니다.

```sh
npm run dev
```

`MockingProvider`는 `NEXT_PUBLIC_API_MOCKING=enabled`일 때 앱 렌더링 전에 worker 등록이 완료되기를 기다립니다. handler가 없는 요청은 `bypass` 정책으로 실제 네트워크 요청을 그대로 통과시킵니다.

### 실제 백엔드로 전환하기

백엔드가 구현되면 코드에서 MSW를 삭제하거나 handler를 바꿀 필요가 없습니다. 환경 변수만 실제 공개 API 기준으로 전환합니다.

```dotenv
# 예: 백엔드가 https://api.newslittle.example/api/v1/home 을 제공하는 경우
NEXT_PUBLIC_API_BASE_URL=https://api.newslittle.example
NEXT_PUBLIC_API_MOCKING=disabled
```

1. 백엔드는 [`api-models.ts`](src/features/contracts/api-models.ts)의 응답·명령 계약을 구현합니다.
2. `screen-api.ts`는 기본 URL 뒤에 `/api/v1/...`를 붙이므로, `NEXT_PUBLIC_API_BASE_URL`에는 `/api/v1` 앞까지만 입력합니다. 끝의 `/`는 넣지 않습니다.
3. 배포 환경에서도 두 환경 변수를 **빌드 시점**에 설정합니다. `NEXT_PUBLIC_*` 값은 브라우저에 공개되므로 API 키·AI 제공자 키·내부 서비스 토큰은 절대 넣지 않습니다.
4. 백엔드는 프론트엔드 origin에 대해 CORS를 허용합니다. 최소한 현재 사용되는 `GET`, `POST`, `PUT` 메서드와 `Accept`, `Content-Type` 헤더를 허용해야 합니다. 인증 방식을 도입하면 그에 필요한 헤더·cookie 정책도 백엔드와 함께 확정합니다.
5. 실제 API 전환 후 `npm run test:e2e`와 스테이징 환경 테스트를 실행합니다. `npm run test:e2e:mocks`는 MSW 계약 회귀용으로 계속 유지합니다.

개발 도중 mock에서 실제 API로 바꿨는데 이전 응답이 남아 있으면 개발 서버를 중지·재시작하고 브라우저를 새로고침합니다. 지속되면 DevTools의 Application > Service Workers에서 `mockServiceWorker.js`를 unregister한 뒤 다시 접속합니다.

## Testing guide

### One-time browser setup

Storybook component test와 Playwright E2E는 Chromium을 사용합니다.

```sh
npm run test:browser:install
```

### Run a specific check

| Command | What it verifies |
| --- | --- |
| `npm run lint` | TypeScript/React 코드의 ESLint 규칙 |
| `npm run build` | Pages Router production build 및 TypeScript 검사 |
| `npm run test:unit` | API Model → View Model 변환 규칙 |
| `npm run storybook` | 격리된 컴포넌트 UI 확인 (`http://localhost:6006`) |
| `npm run storybook:build` | Storybook 정적 빌드 가능 여부 |
| `npm run test:storybook` | Chromium에서 Storybook의 interaction/component test |
| `npm run test:e2e` | production build에서 사용자 라우트와 내비게이션 E2E |
| `npm run test:e2e:mocks` | MSW service worker가 `/api/v1/home` 계약을 가로채는지 E2E |
| `npm test` | unit, Storybook, 일반 E2E, mock API E2E 전체 실행 |

권장 로컬 확인 순서입니다.

```sh
npm run lint
npm run build
npm test
```

## Initial routes

| Route | Purpose |
| --- | --- |
| `/` | 홈 및 향후 오늘 목록·이전 목록 오버레이 위치 |
| `/quiz`, `/quiz/[sessionId]`, `/quiz/[sessionId]/result` | 회원용 숏폼 퀴즈 시작·풀이·결과 |
| `/random`, `/random/[sessionId]`, `/random/[sessionId]/result` | 랜덤 퀴즈 시작·풀이·결과 |
| `/archive` | 아카이브 |
| `/settings` | 설정 |

## Wireframes

전체 중간 충실도 와이어프레임 원본은 [`design/wireframe/wireframe.pen`](design/wireframe/wireframe.pen)입니다. 화면 ID별 추출 파일과 공통 라이브러리는 [`design/README.md`](design/README.md)를 따릅니다. 화면과 Pages Router 파일의 매핑은 [`design/wireframe/README.md`](design/wireframe/README.md)에 있습니다.

현재 화면은 와이어프레임 반영 전의 라우트 골격입니다. API 계약과 View Model은 준비되어 있으므로, 화면별 pen 파일과 UI를 추가할 때 이 모델 경계를 그대로 사용합니다.
