# Mid-fi wireframe mapping

[`wireframe.pen`](./wireframe.pen)은 전체 서비스의 현재 mid-fi 와이어프레임 원본이다. 화면 설계를 고도화하고, 고도화된 결과물을 디렉토리 별로 생성한다.

| Wireframe frame | Pages Router file | URL |
| --- | --- | --- |
| SCR-01 홈, SCR-02 오늘 목록 | `src/pages/index.tsx` | `/` |
| SCR-03 숏폼 퀴즈 시작 | `src/pages/quiz/index.tsx` | `/quiz` |
| SCR-04 숏폼 문제 풀이 | `src/pages/quiz/[sessionId].tsx` | `/quiz/[sessionId]` |
| SCR-05 숏폼 회차 결과 | `src/pages/quiz/[sessionId]/result.tsx` | `/quiz/[sessionId]/result` |
| SCR-10 랜덤 퀴즈 시작 | `src/pages/random/index.tsx` | `/random` |
| SCR-11 랜덤 문제 풀이 | `src/pages/random/[sessionId].tsx` | `/random/[sessionId]` |
| SCR-12 랜덤 회차 결과 | `src/pages/random/[sessionId]/result.tsx` | `/random/[sessionId]/result` |
| SCR-07 아카이브 | `src/pages/archive.tsx` | `/archive` |
| SCR-09 설정 | `src/pages/settings.tsx` | `/settings` |

SCR-06 이전 목록 처리, SCR-08 로그인, GLB-03 신고는 IA에서 라우트가 없는 오버레이라고 정의했다. 따라서 독립 파일 경로가 아니라 각각의 진입 화면 안에서 상태로 관리한다.
