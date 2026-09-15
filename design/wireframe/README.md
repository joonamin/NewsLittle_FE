# Mid-fi wireframe mapping

[`wireframe.pen`](./wireframe.pen)은 전체 서비스의 mid-fi 와이어프레임 **아카이브**다. 살아 있는 토큰·컴포넌트 정본은 [`../library/newslittle.lib.pen`](../library/newslittle.lib.pen)이다. 이 파일은 사이트맵·라우팅 흐름·고도화 스케치를 포함하며, 화면 추출의 원본 스냅샷이다.

| Wireframe frame | Pages Router file | URL | 추출 파일 |
| --- | --- | --- | --- |
| SCR-01 홈, SCR-02 오늘 목록 | `src/pages/index.tsx` | `/` | [`../user-screens/scr-01-home.pen`](../user-screens/scr-01-home.pen), [`../user-screens/scr-02-today-list.pen`](../user-screens/scr-02-today-list.pen) |
| SCR-03 숏폼 퀴즈 시작 | `src/pages/quiz/index.tsx` | `/quiz` | [`../user-screens/scr-03-quiz-start.pen`](../user-screens/scr-03-quiz-start.pen) |
| SCR-04 숏폼 문제 풀이 | `src/pages/quiz/[sessionId].tsx` | `/quiz/[sessionId]` | [`../user-screens/scr-04-quiz-play.pen`](../user-screens/scr-04-quiz-play.pen) |
| SCR-05 숏폼 회차 결과 | `src/pages/quiz/[sessionId]/result.tsx` | `/quiz/[sessionId]/result` | [`../user-screens/scr-05-quiz-result.pen`](../user-screens/scr-05-quiz-result.pen) |
| SCR-10 랜덤 퀴즈 시작 | `src/pages/random/index.tsx` | `/random` | [`../user-screens/scr-10-random-start.pen`](../user-screens/scr-10-random-start.pen) |
| SCR-11 랜덤 문제 풀이 | `src/pages/random/[sessionId].tsx` | `/random/[sessionId]` | [`../user-screens/scr-11-random-play.pen`](../user-screens/scr-11-random-play.pen) |
| SCR-12 랜덤 회차 결과 | `src/pages/random/[sessionId]/result.tsx` | `/random/[sessionId]/result` | [`../user-screens/scr-12-random-result.pen`](../user-screens/scr-12-random-result.pen) |
| SCR-07 아카이브 | `src/pages/archive.tsx` | `/archive` | [`../user-screens/scr-07-archive.pen`](../user-screens/scr-07-archive.pen) |
| SCR-09 설정 | `src/pages/settings.tsx` | `/settings` | [`../user-screens/scr-09-settings.pen`](../user-screens/scr-09-settings.pen) |

SCR-06 이전 목록 처리, SCR-08 로그인, GLB-03 신고는 IA에서 라우트가 없는 오버레이라고 정의했다. 따라서 독립 라우트 파일이 아니라 진입 화면 안에서 상태로 관리한다. 디자인 추출본은 [`../user-screens/scr-06-previous-list.pen`](../user-screens/scr-06-previous-list.pen), [`../user-screens/scr-08-login.pen`](../user-screens/scr-08-login.pen), [`../global/glb-03-report.pen`](../global/glb-03-report.pen)이다.

공통 컴포넌트와 설계 기준은 [`../library/newslittle.lib.pen`](../library/newslittle.lib.pen)이다.
