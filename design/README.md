# NewsLittle 디자인 파일

역할은 이렇게 나뉜다.

| 경로 | 역할 |
| --- | --- |
| [`wireframe/wireframe.pen`](wireframe/wireframe.pen) | mid-fi **아카이브**. 사이트맵·라우팅 흐름·고도화 스케치를 포함한 추출 원본. 살아 있는 정본이 아니므로 여기서 토큰·컴포넌트를 고치지 않는다. |
| [`library/newslittle.lib.pen`](library/newslittle.lib.pen) | **진실 원천**. 토큰(`nl-*`)·테마·reusable 컴포넌트 원본. 이미 pen.dev 디자인 라이브러리다. |
| [`user-screens/`](user-screens/) | SCR-01 … SCR-12. 화면 프레임 + 라이브러리 인스턴스만. 한 파일 = 한 화면 ID. |
| [`admin-screens/`](admin-screens/) | ADM-01 … ADM-06. 인스턴스만. |
| [`global/glb-03-report.pen`](global/glb-03-report.pen) | GLB-03 신고 오버레이. 인스턴스만. |

GLB-01 주 내비게이션과 GLB-02 출처·AI 표시 규칙은 화면 파일이 아니라 라이브러리에 둔다. 화면 `.pen`에는 `variables`/`themes`를 두지 않는다. `$nl-*`와 컴포넌트 `ref`는 라이브러리에서 해석한다.

## 공통 라이브러리

토큰·컴포넌트 원본은 [`library/newslittle.lib.pen`](library/newslittle.lib.pen)만 수정한다. 화면 파일에는 원본을 복제하지 않는다.

화면 `.pen`은 `imports`로 이 라이브러리를 가리킨다. 처음 열 때 Libraries 탭 → Imported Libraries에 안 보이면 **+**로 `newslittle.lib.pen`을 고른다. 파일을 다시 열면 라이브러리 쪽 수정이 인스턴스·토큰에 반영된다.

시각 고도화는 하지 않았다. 인라인으로 그려진 버튼·퀴즈 옵션을 라이브러리 인스턴스로 바꾸는 일은 후속이다.

## 이용자 화면

| 파일 | 들어 있는 프레임 |
| --- | --- |
| [`user-screens/scr-01-home.pen`](user-screens/scr-01-home.pen) | 비회원, 비회원·담기 전, 회원+오늘 목록 |
| [`user-screens/scr-02-today-list.pen`](user-screens/scr-02-today-list.pen) | 오늘 목록 패널만 격리 (피드 열 제거) |
| [`user-screens/scr-03-quiz-start.pen`](user-screens/scr-03-quiz-start.pen) | 숏폼 퀴즈 시작 |
| [`user-screens/scr-04-quiz-play.pen`](user-screens/scr-04-quiz-play.pen) | 선택형 + 주관식 8상태 |
| [`user-screens/scr-05-quiz-result.pen`](user-screens/scr-05-quiz-result.pen) | 숏폼 회차 결과 |
| [`user-screens/scr-06-previous-list.pen`](user-screens/scr-06-previous-list.pen) | 이전 목록 처리 |
| [`user-screens/scr-07-archive.pen`](user-screens/scr-07-archive.pen) | 아카이브 |
| [`user-screens/scr-08-login.pen`](user-screens/scr-08-login.pen) | 로그인 모달 |
| [`user-screens/scr-09-settings.pen`](user-screens/scr-09-settings.pen) | 설정 |
| [`user-screens/scr-10-random-start.pen`](user-screens/scr-10-random-start.pen) | 랜덤 퀴즈 시작 |
| [`user-screens/scr-11-random-play.pen`](user-screens/scr-11-random-play.pen) | 랜덤 문제 풀이 |
| [`user-screens/scr-12-random-result.pen`](user-screens/scr-12-random-result.pen) | 랜덤 회차 결과 |

라우트 매핑은 [`wireframe/README.md`](wireframe/README.md)를 따른다. SCR-06·SCR-08·GLB-03은 독립 라우트가 아니라 진입 화면의 오버레이다.

## 운영 · 전역

| 파일 | 화면 |
| --- | --- |
| [`admin-screens/adm-01-dashboard.pen`](admin-screens/adm-01-dashboard.pen) | ADM-01 운영 대시보드 |
| [`admin-screens/adm-02-usage-basis.pen`](admin-screens/adm-02-usage-basis.pen) | ADM-02 이용 근거·상태 |
| [`admin-screens/adm-03-review-queue.pen`](admin-screens/adm-03-review-queue.pen) | ADM-03 검수 대기열 |
| [`admin-screens/adm-04-publish-correct-suspend.pen`](admin-screens/adm-04-publish-correct-suspend.pen) | ADM-04 게시·정정·중단 |
| [`admin-screens/adm-05-deletion-expiry.pen`](admin-screens/adm-05-deletion-expiry.pen) | ADM-05 삭제·만료 상태 |
| [`admin-screens/adm-06-reports.pen`](admin-screens/adm-06-reports.pen) | ADM-06 신고 처리 |
| [`global/glb-03-report.pen`](global/glb-03-report.pen) | GLB-03 신고 |

사이트맵·라우팅 계약·라우팅 흐름 표시·디자인 고도화 스케치는 원본 `wireframe.pen`에만 있다.
