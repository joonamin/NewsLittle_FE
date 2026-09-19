import type { ReactNode } from "react";
import Link from "next/link";

function PrivacyContent({
  title,
  content,
}: {
  title: string;
  content: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-10 last:border-b-0">
      <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="space-y-4 text-[15px] leading-7 text-slate-700">
        {content}
      </div>
    </section>
  );
}

const tableClassName =
  "w-full min-w-[720px] border-collapse text-left text-sm text-slate-700";

const thClassName =
  "border-b border-slate-300 bg-slate-50 px-4 py-3 font-semibold text-slate-900";

const tdClassName =
  "border-b border-slate-200 px-4 py-3 align-top leading-6";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
        {/* Header */}
        <header className="mb-10 border-b border-slate-900 pb-10">
          <p className="mb-3 text-sm font-medium text-slate-500">
            NewsLittle
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            개인정보 처리방침
          </h1>

          <div className="mt-6 space-y-1 text-sm leading-6 text-slate-500">
            <p>최근 개정일: 2026년 9월 20일</p>
            <p>시행일: 2026년 9월 20일</p>
          </div>

          {/* 비상업적 프로젝트 고지 */}
          <div className="mt-7 rounded-xl border border-sky-200 bg-sky-50/70 p-5 text-[15px] leading-7 text-slate-800">
            <h2 className="mb-2 font-bold text-sky-950">
              [비상업적 사이드 프로젝트 운영 고지]
            </h2>
            <p>
              NewsLittle(뉴스리틀, 이하 &ldquo;서비스&rdquo;)은 개인 개발자(강민준)가 비상업적·학습용 목적으로 운영하는 <strong>개인 사이드 프로젝트</strong>입니다.
              본 서비스는 일체의 유료 과금, 영리 목적의 데이터 판매, 제3자 타겟 광고 등을 전혀 수행하지 않으며,
              이용자 식별 및 서비스 핵심 기능 제공에 필요한 최소한의 정보만을 처리합니다.
            </p>
          </div>

          {/* Google 사용자 데이터 처리 및 투명성 선언 (Hero Box) */}
          <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-6 md:p-8 text-[15px] leading-7 text-slate-800 shadow-sm space-y-5">
            <div className="border-b border-indigo-100 pb-4">
              <span className="inline-block rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white tracking-wide">
                Google OAuth Verification Compliance
              </span>
              <h2 className="mt-2 text-xl font-bold text-indigo-950 md:text-2xl">
                Google API 서비스 사용자 데이터 처리방침 및 투명성 고지
              </h2>
              <p className="mt-1 text-sm text-indigo-900">
                Google API Services User Data Policy &amp; Limited Use Disclosure
              </p>
            </div>

            <p>
              NewsLittle은 이용자의 개인정보 및 Google 사용자 데이터를 투명하고 안전하게 보호하기 위해,
              Google OAuth 2.0 및 OpenID Connect를 통해 접근·수집하는 데이터의 범위, 이용 목적, 보관 기간, 보안 조치 및 삭제 권한을 명확히 공개합니다.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-2">
                <h3 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="text-indigo-600">1.</span> 앱 및 개발자 식별 정보
                </h3>
                <ul className="space-y-1 text-slate-600">
                  <li><strong>애플리케이션:</strong> NewsLittle (뉴스리틀)</li>
                  <li><strong>웹사이트:</strong> https://newslittle.joonamin.dev</li>
                  <li><strong>개발 및 운영자:</strong> 강민준 (Kang Minjun)</li>
                  <li><strong>문의처:</strong> joonamin44@gmail.com</li>
                </ul>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-2">
                <h3 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="text-indigo-600">2.</span> 수집하는 Google 데이터 (2종 한정)
                </h3>
                <ul className="space-y-1 text-slate-600">
                  <li><strong>1) Google 고유 식별자 (sub):</strong> 사용자 고유 계정 ID</li>
                  <li><strong>2) 이메일 주소 (email):</strong> 계정 인증 및 식별용</li>
                  <li className="text-xs text-rose-600 pt-1 font-medium">
                    ※ 프로필 이름, 사진, 연락처, Google Drive, Gmail 등 기타 일체의 민감 권한은 일절 수집·접근하지 않습니다.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-2">
                <h3 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="text-indigo-600">3.</span> 데이터 이용 목적 (핵심 기능 전용)
                </h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• 회원 로그인 인증 및 중복 가입 방지</li>
                  <li>• 관심 뉴스 주제 및 아카이브(저장 기사) 매핑</li>
                  <li className="text-xs text-emerald-700 pt-1 font-medium">
                    ※ 타겟 광고, 데이터 재판매, 신용도 평가, 대출 등 상업적 활용 절대 금지
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-2">
                <h3 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="text-indigo-600">4.</span> 제3자 공유 및 판매 금지 (No-Sharing)
                </h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• 제3자 판매(Sell), 임대(Rent), 거래(Trade) 일체 없음</li>
                  <li>• 마케팅, 광고주, 데이터 브로커 외부 이전 없음</li>
                  <li className="text-xs text-slate-500 pt-1">
                    인프라 위탁(Azure, Cloudflare) 외 외부 제공 없음
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-white p-5 space-y-3">
              <h3 className="font-bold text-indigo-950 text-base">
                5. 데이터 보유 기간 및 이용자의 삭제·직접 철회 권한
              </h3>
              <p className="text-sm text-slate-700">
                수집된 Google 데이터는 회원 탈퇴 시까지 보관되며, 이용자는 언제든지 다음 3가지 방법으로 데이터를 영구 삭제하거나 권한을 직접 철회할 수 있습니다:
              </p>
              <div className="grid gap-3 sm:grid-cols-3 text-xs leading-5">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <strong className="text-slate-900 block mb-1">방법 ① 서비스 내 탈퇴</strong>
                  설정(<code className="rounded bg-slate-200 px-1 py-0.5 text-[11px]">/settings</code>) 화면에서 &lsquo;회원 탈퇴&rsquo; 또는 &lsquo;기록 삭제&rsquo; 시 데이터베이스에서 즉시 영구 삭제됩니다.
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <strong className="text-slate-900 block mb-1">방법 ② Google 직접 철회</strong>
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 underline underline-offset-2 block mt-0.5"
                  >
                    Google 계정 권한 관리 ↗
                  </a>
                  페이지에서 NewsLittle 앱에 부여된 접근 권한을 언제든지 즉시 직접 해제할 수 있습니다.
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <strong className="text-slate-900 block mb-1">방법 ③ 이메일 요청</strong>
                  개인정보 보호책임자(<a href="mailto:joonamin44@gmail.com" className="underline text-indigo-600">joonamin44@gmail.com</a>)로 요청 시 확인 후 지체 없이 수동 영구 파기합니다.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950 space-y-1.5">
              <p className="font-bold">
                6. 인공지능(AI) / 머신러닝(ML) 모델 학습 금지 및 Limited Use 준수
              </p>
              <p className="text-xs text-amber-900 leading-5">
                • <strong>AI/ML 학습 금지:</strong> 이용자의 Google 사용자 데이터는 비개인화된(non-personalized) 또는 일반 인공지능(AI)·머신러닝(ML) 모델의 개발, 훈련, 개선에 절대 사용되지 않습니다.<br />
                • <strong>사람의 열람 제한:</strong> 이용자의 사전 동의 또는 법률적 강제 사유가 없는 한 운영자를 포함한 사람의 인적 열람을 엄격히 금지합니다.<br />
                • <strong>Limited Use 선언:</strong> NewsLittle의 Google API 수신 정보 사용 및 이전은{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline underline-offset-2"
                >
                  Google API Services User Data Policy
                </a>
                의 제한적 사용(Limited Use) 요구사항을 엄격히 준수합니다.
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-[15px] leading-7 text-slate-700">
            NewsLittle (뉴스리틀)(이하 &ldquo;처리자&rdquo;)는 서비스를 운영하면서 이용자의 개인정보를 처리하는 경우
            「개인정보 보호법」 및 Google API Services User Data Policy 등 관계 법령과 플랫폼 정책을 철저히 준수합니다.
          </p>
        </header>

        <PrivacyContent
          title="제1조 목적"
          content={
            <>
              <p>
                본 개인정보 처리방침은 서비스가 Google OAuth 2.0 로그인을 제공하고 계정
                및 서비스 이용 정보를 처리하는 과정에서 어떠한 개인정보를
                수집·이용·보관·파기하는지와 이용자가 자신의 개인정보에 관하여
                행사할 수 있는 권리를 투명하게 안내하기 위한 것입니다.
              </p>

              <p>
                서비스의 프론트엔드 도메인은{" "}
                <strong className="font-semibold text-slate-900">
                  https://newslittle.joonamin.dev
                </strong>
                , 백엔드 API 도메인은{" "}
                <strong className="font-semibold text-slate-900">
                  https://api-newslittle.joonamin.dev
                </strong>
                입니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제2조 개인정보의 처리 목적"
          content={
            <>
              <p>서비스는 개인정보를 다음 목적에 한하여 최소한으로 처리합니다.</p>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>구분</th>
                      <th className={thClassName}>처리 목적</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      [
                        "Google 로그인 및 계정 식별",
                        "Google 계정 고유식별자(sub)를 통한 사용자 계정 식별, 중복 가입 방지 및 로그인 세션 생성",
                      ],
                      [
                        "회원 식별 및 계정 표시",
                        "로그인한 이용자의 이메일 주소를 활용한 본인 확인 및 설정 화면 내 계정 표시",
                      ],
                      [
                        "관심 주제 관리",
                        "이용자가 직접 선택한 뉴스 관심 주제를 계정과 연동하여 저장 및 설정 유지",
                      ],
                      [
                        "서비스 기록 관리 (아카이브)",
                        "이용자가 직접 선택하여 보관한 오늘 기사 목록, 숏폼/랜덤 퀴즈 세션 이력 관리 및 기록 삭제 처리",
                      ],
                      [
                        "비회원 기능 제공",
                        "로그인하지 않은 이용자의 임시 관심 주제 브라우저 저장, 비회원 랜덤 퀴즈 및 신고 소유 확인",
                      ],
                      [
                        "서비스 보안 및 보호",
                        "비정상적인 과도한 요청(DDoS, 크롤링) 방지를 위한 단시간의 네트워크 IP 주소 이용",
                      ],
                    ].map(([label, description]) => (
                      <tr key={label}>
                        <td className={`${tdClassName} font-medium text-slate-900`}>
                          {label}
                        </td>
                        <td className={tdClassName}>{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                서비스의 회원 인증 수단은 Google OAuth 2.0 및 OpenID Connect 단일 방식이며,
                자체 이메일·비밀번호를 이용한 별도의 회원가입이나 본인인증(CI·DI)은
                일체 요구하지 않습니다. 최초 Google 로그인이 곧 서비스 가입을
                겸합니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제3조 처리하는 개인정보 항목 및 수집 방법"
          content={
            <>
              <div>
                <h3 className="mb-3 font-semibold text-slate-950">
                  1. Google 로그인 연동 정보 (2개 항목에 한정)
                </h3>

                <p>
                  서비스가 Google 로그인 과정에서 요청하는 OAuth Scope는{" "}
                  <strong className="font-semibold text-slate-900">
                    openid, email (https://www.googleapis.com/auth/userinfo.email)
                  </strong>
                  의 필수 최소 범위에 엄격히 한정됩니다. 서비스는 profile scope를 요구하지 않으며, 이용자의 프로필 사진, 성명(이름), 전화번호, 생년월일, 성별, 주소, Google Drive, Gmail, 캘린더, 연락처 등 일체의 추가 정보나 민감한 권한(Sensitive/Restricted Scopes)을 요청하거나 접근하지 않습니다.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>처리 항목</th>
                      <th className={thClassName}>수집 출처</th>
                      <th className={thClassName}>이용 목적</th>
                      <th className={thClassName}>저장 위치</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      [
                        "Google 계정 고유식별자 (sub)",
                        "Google ID 토큰",
                        "계정 연동, 중복 가입 방지, 로그인 세션 주체 식별, 이용자가 선택한 아카이브 및 관심 주제 매핑",
                        "PostgreSQL (암호화 디스크), Redis 세션",
                      ],
                      [
                        "이메일 주소 (email)",
                        "Google ID 토큰",
                        "가입 및 로그인 계정 인증, 화면 내 계정 식별자 표시",
                        "PostgreSQL (암호화 디스크), Redis 세션",
                      ],
                      [
                        "역할 (MEMBER 또는 ADMIN)",
                        "서비스 서버 생성",
                        "계정별 접근 권한 관리",
                        "서버 계정 저장소",
                      ],
                      [
                        "관심 주제",
                        "이용자 직접 선택",
                        "개인화된 뉴스 탐색 제공 및 설정 유지",
                        "계정 연계 저장소",
                      ],
                    ].map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, index) => (
                          <td
                            key={cell}
                            className={`${tdClassName} ${
                              index === 0 ? "font-medium text-slate-900" : ""
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                서비스는 프로필 이름이나 사진 정보를 수집하지 않으므로, 화면상에서 로그인된 계정을 표시할 때에는 이용자의 이메일 주소(또는 @ 앞부분)를 표시 식별자로 사용합니다.
              </p>

              <p>
                비회원 상태에서 브라우저에 임시 설정한 관심 주제가 있는 경우, 해당 계정에 관심
                주제를 저장한 적이 없을 때에 한하여 최초 로그인 과정에서 1회 계정 설정으로 이관하여 반영합니다. 이미 저장된 계정의 관심 주제는
                덮어쓰지 않습니다.
              </p>

              <div className="pt-3">
                <h3 className="mb-3 font-semibold text-slate-950">
                  2. 서비스 이용 활동 정보
                </h3>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>항목</th>
                      <th className={thClassName}>처리 목적</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      ["기사 선택 기록 (오늘 목록)", "이용자가 당일 읽기 위해 선택한 기사 목록 보관"],
                      ["아카이브 기록", "이용자가 보관을 결정한 지난 기사 목록 관리"],
                      ["퀴즈 세션 및 답변", "숏폼 및 랜덤 퀴즈 진행과 정답 채점 결과 표시"],
                      ["기사 노출 계측", "기사 조회 수 집계 (익명 통계)"],
                      ["비회원 임시 식별자", "비회원의 랜덤 퀴즈 풀이 및 세션 유지"],
                      ["IP 주소", "DDoS 및 비정상 요청 차단을 위한 단시간 요율 제한(Rate Limit)"],
                    ].map(([label, purpose]) => (
                      <tr key={label}>
                        <td className={`${tdClassName} font-medium text-slate-900`}>
                          {label}
                        </td>
                        <td className={tdClassName}>{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                운영 환경에서는 요청 과다 방지를 위해 Cloudflare의
                CF-Connecting-IP 값을 극히 짧은 시간(수 초~수 분) 동안만 인메모리에서 이용하며, IP
                주소를 회원 계정 정보로 영구 저장하지 않습니다.
              </p>

              <p>
                주관식 퀴즈 채점 시 외부 AI API에는 문항 내용, 이용자의 답변 텍스트 및 정답 기준 데이터만
                전송되며, 이용자의 Google 고유 식별자나 이메일 주소 등 개인 식별 정보는 일절 전송되지 않습니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제4조 수집하지 않는 정보"
          content={
            <>
              <p>서비스는 데이터 최소 수집 원칙에 따라 다음의 정보를 수집하거나 저장하지 않습니다.</p>

              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Google 프로필 정보:</strong> 프로필 사진, 성명(이름), 언어, 거주 지역, 성별, 생년월일
                </li>
                <li>
                  <strong>민감하거나 제한된 권한 정보:</strong> Google Drive 문서, Gmail 이메일 내용, Google 캘린더 일정, 주소록 연락처
                </li>
                <li>
                  <strong>본인인증 및 결제정보:</strong> 주민등록번호, 외국인등록번호, 통신사 본인인증값(CI/DI), 신용카드/계좌 결제정보
                </li>
                <li>
                  <strong>인증 토큰 비밀정보:</strong> Google 계정의 비밀번호, 이용자의 장기 리프레시 토큰(Refresh Token)
                </li>
              </ul>

              <p>
                Google 토큰 교환 시 서비스가 요청하지 않은 프로필 정보가 응답 객체에 부수적으로 포함되어 전달되더라도,
                서버는 이를 파싱하거나 데이터베이스에 저장하지 않고 즉시 폐기합니다.
              </p>

              <p>
                Google 인가 코드는 Google 토큰 엔드포인트와의 일회성 교환에 즉시 사용된 후 폐기되며 보관되지 않습니다. 서비스는 access_type=online 방식으로 동작하여 백엔드에 장기 리프레시 토큰을 저장하지 않습니다.
              </p>

              <p>서비스는 만 14세 미만 아동의 개인정보를 고의로 수집하지 않습니다.</p>
            </>
          }
        />

        <PrivacyContent
          title="제5조 개인정보의 처리 및 보유 기간"
          content={
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>정보 항목</th>
                      <th className={thClassName}>보유 기간</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      ["계정 정보 (Google ID 식별자, 이메일 주소) 및 관심 주제", "회원 탈퇴 시까지 (탈퇴 즉시 영구 파기)"],
                      ["서비스 활동 기록 (기사 선택 기록, 아카이브, 퀴즈 세션)", "회원 탈퇴 또는 설정 화면에서 &lsquo;기록 삭제&rsquo; 요청 시까지"],
                      [
                        "로그인 세션 (Redis)",
                        "유휴 30분 또는 발급 후 최대 8시간 (로그아웃 시 즉시 파기)",
                      ],
                      ["서버 접속 로그", "3개월 (통신비밀보호법 준수)"],
                      [
                        "탈퇴 처리 이력 로그",
                        "30일 (부정 이용 방지 및 처리 이력 검증, 개인식별값 제거 후 보관)",
                      ],
                    ].map(([label, period]) => (
                      <tr key={label}>
                        <td className={`${tdClassName} font-medium text-slate-900`}>
                          {label}
                        </td>
                        <td className={tdClassName}>{period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                데이터베이스, Redis 캐시 및 서버 인프라가 위치한 물리적 클라우드 리전은 <strong>대한민국 서울 (Microsoft Azure Korea Central)</strong>입니다.
              </p>

              <p>
                이용자가 설정 화면에서 <strong>기록 삭제</strong>를 요청하는 경우, 계정과 관심 주제 설정은 유지되며 당일 기사 선택 기록, 퀴즈 세션 및 아카이브 기록이 즉시 삭제됩니다.
              </p>

              <p>
                이용자가 <strong>회원 탈퇴</strong>를 완료하는 경우, 계정 정보(Google 고유식별자, 이메일 주소)와 연결된 관심 주제, 기사 보관 기록, 퀴즈 세션 등 모든 개인정보가 데이터베이스 및 백업 환경에서 지체 없이 영구 파기됩니다.
              </p>

              <p>
                탈퇴 후 동일한 Google 계정으로 다시 로그인하더라도 기존에 삭제된 기록은 복구되지 않으며 완전히 새로운 서비스 계정으로 가입 처리됩니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제6조 개인정보의 제3자 제공, 처리위탁 및 Google 사용자 데이터 보호 정책"
          content={
            <>
              <div>
                <h3 className="mb-3 font-semibold text-slate-950">
                  1. Google 로그인 통신 및 처리위탁
                </h3>
                <p>
                  서비스는 Google 로그인을 제공하기 위해 Google LLC의 OAuth 2.0 및 OpenID Connect 엔드포인트와 통신합니다.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>처리 상대방</th>
                      <th className={thClassName}>전달되는 정보</th>
                      <th className={thClassName}>목적</th>
                      <th className={thClassName}>시점·방법</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className={`${tdClassName} font-medium text-slate-900`}>
                        Google LLC
                      </td>
                      <td className={tdClassName}>Google ID 토큰</td>
                      <td className={tdClassName}>
                        로그인 인증 및 공개키 기반 토큰 검증
                      </td>
                      <td className={tdClassName}>
                        Google 로그인 시 브라우저에서 직접 수신 및 백엔드 검증
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                이용자의 Google 비밀번호는 서비스에 결코 전달되지 않으며 처리자가 이를 수집하거나 저장하지 않습니다. 서비스는 로그인 검증 목적 외의 목적으로 이용자 데이터를 Google에 전송하지 않습니다.
              </p>

              <div className="rounded-lg bg-slate-50 px-4 py-4">
                <p>
                  안정적인 서비스 운영을 위한 클라우드 인프라 및 보안 수탁자:
                  <br />
                  <strong className="font-semibold text-slate-900">
                    Microsoft Azure (백엔드 서버 호스팅, 데이터베이스 및 AI 추론 API), Vercel Inc. (프론트엔드 정적 호스팅 및 CDN), Cloudflare, Inc. (DNS, DDoS 방어 및 SSL 암호화 터널)
                  </strong>
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-slate-950">
                  2. Google 사용자 데이터 제3자 공유·이전 및 판매 금지 (No-Sharing Policy)
                </h3>
                <p>
                  NewsLittle은 Google API를 통해 수집된 이용자의 데이터(Google 사용자 ID <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">sub</code>, 이메일 주소 <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">email</code>)를 어떠한 경우에도 제3자에게 판매(Sell), 임대(Rent), 대여, 거래(Trade), 공개(Disclose)하거나 이전(Transfer)하지 않습니다.
                </p>
                <p>
                  수집된 데이터는 광고주, 데이터 브로커, 마케팅 분석 업체 등에 일절 제공되지 않으며, 타겟 광고(Targeted Advertising), 신용도 평가, 대출 등 상업적 목적으로 일체 활용되지 않습니다.
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-slate-950">
                  3. Google 사용자 데이터의 삭제 및 직접 권한 철회 (Direct Revocation)
                </h3>
                <p>
                  이용자는 언제든지 자신의 Google 계정과 연동된 데이터를 삭제하거나 권한을 직접 철회할 수 있습니다.
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-slate-900">서비스 내 즉시 삭제:</strong> 서비스 설정 화면(<code className="rounded bg-slate-100 px-1 py-0.5 text-sm text-slate-900">/settings</code>)에서 &lsquo;회원 탈퇴&rsquo; 또는 &lsquo;기록 삭제&rsquo;를 요청하면 데이터베이스 및 캐시 서버에서 이용자의 Google 고유 식별자, 이메일 및 모든 활동 데이터가 지체 없이 즉시 영구 파기됩니다.
                  </li>
                  <li>
                    <strong className="text-slate-900">Google 계정에서 직접 권한 철회:</strong> 서비스 화면에 접속하지 않더라도,{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-950 underline underline-offset-4"
                    >
                      Google 계정 서드파티 액세스 권한 관리 페이지(https://myaccount.google.com/permissions)
                    </a>
                    에서 NewsLittle 앱에 부여한 접근 권한을 언제든지 직접 즉시 해제(Revoke)할 수 있습니다. 권한을 해제하면 서비스는 더 이상 이용자의 Google 계정에 접근할 수 없습니다.
                  </li>
                  <li>
                    <strong className="text-slate-900">이메일 문의를 통한 수동 삭제:</strong> 개인정보 보호책임자(<a href="mailto:joonamin44@gmail.com" className="underline text-indigo-600">joonamin44@gmail.com</a>)에게 삭제를 요청하는 경우 본인 확인 후 지체 없이 모든 연동 데이터를 영구 파기합니다.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-slate-950">
                  4. Google API Services User Data Policy 및 Limited Use 준수
                </h3>
                <p>
                  NewsLittle이 Google API로부터 수신한 정보의 사용 및 다른 앱으로의 이전은{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-slate-950 underline underline-offset-4"
                  >
                    Google API Services User Data Policy
                  </a>
                  의 제한적 사용(Limited Use) 요구사항을 엄격히 준수합니다.
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-slate-900">AI/ML 모델 학습 금지:</strong> 수집된 이용자의 Google 데이터 및 서비스 이용 내역은 비개인화된(non-personalized) 또는 일반 인공지능(AI)이나 머신러닝(ML) 모델의 개발, 개선 또는 파인튜닝에 일체 사용되지 않습니다.
                  </li>
                  <li>
                    <strong className="text-slate-900">사람의 열람 제한:</strong> 이용자의 명시적 사전 동의가 있거나, 법률 준수 또는 시스템 보안 침해 대응 등 필수불가결한 경우를 제외하고 어떠한 사람도 이용자의 Google 사용자 데이터를 열람하지 않습니다.
                  </li>
                </ul>
              </div>
            </>
          }
        />

        <PrivacyContent
          title="제7조 개인정보 자동 수집 장치(쿠키)의 설치·운영 및 거부"
          content={
            <>
              <div>
                <h3 className="mb-3 font-semibold text-slate-950">
                  1. 로그인 세션 쿠키
                </h3>

                <p>
                  서비스는 로그인 상태 유지를 위해{" "}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-900">
                    newslittle_session
                  </code>{" "}
                  쿠키를 사용합니다.
                </p>
              </div>

              <p>
                쿠키에는 이메일 주소나 Google 고유 식별자 등 개인정보 자체가 일체 포함되지 않으며, 서버
                세션 정보를 안전하게 조회하기 위한 256비트 난수 형태의 불투명 토큰만
                저장합니다.
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>HttpOnly: 자바스크립트 스크립트 접근 차단 (XSS 방어)</li>
                <li>SameSite=Lax: CSRF 방어</li>
                <li>운영환경에서 Secure: HTTPS 암호화 연결에서만 전송</li>
                <li>Domain 미설정 host-only 쿠키</li>
                <li>Max-Age 미설정 브라우저 세션 쿠키</li>
              </ul>

              <p>
                서버의 Redis 세션은 마지막 요청 이후 30분 동안 이용이 없으면
                만료되며, 최초 발급 후 8시간이 지나면 요청 여부와 관계없이
                절대 만료됩니다. 세션 만료 시 서버와 클라이언트 모두에서 토큰이 무효화됩니다.
              </p>

              <div className="pt-3">
                <h3 className="mb-3 font-semibold text-slate-950">
                  2. 비회원 식별 쿠키
                </h3>

                <p>
                  비회원 상태에서의 퀴즈 풀이 및 서비스 이용 연속성을 위해{" "}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-900">
                    newslittle_anonymous_id
                  </code>{" "}
                  쿠키를 사용합니다.
                </p>
              </div>

              <p>
                해당 값은 UUID 기반의 임의 난수 식별값으로 최대 64자이며 유효기간은
                7일입니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 로그인 세션 쿠키를 차단할 경우 회원 전용 기능(아카이브, 계정 동기화 등)의 이용이 불가능합니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제8조 정보주체의 권리·의무 및 행사 방법"
          content={
            <>
              <p>
                이용자는 관계 법령 및 플랫폼 규정에 따라 언제든지 자신의 개인정보에 대해 다음의 권리를 행사할 수 있습니다.
              </p>

              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <strong className="text-slate-900">계정 정보 확인:</strong>{" "}
                  설정 화면에서 로그인된 이메일 주소, 현재 역할, 관심 주제 설정 및 서비스 이용 상태를 직접 열람할 수 있습니다.
                </li>
                <li>
                  <strong className="text-slate-900">관심 주제 정정:</strong>{" "}
                  설정 화면에서 언제든지 구독할 뉴스 관심 주제를 수정하거나 해제할 수 있습니다.
                </li>
                <li>
                  <strong className="text-slate-900">기록 삭제:</strong>{" "}
                  설정 화면에서 &lsquo;기록 삭제&rsquo;를 요청하여 계정은 유지한 채 과거 기사 선택 기록, 퀴즈 풀이 이력 및 아카이브 데이터를 일괄 영구 삭제할 수 있습니다.
                </li>
                <li>
                  <strong className="text-slate-900">회원 탈퇴 및 계정 삭제:</strong>{" "}
                  설정 화면에서 &lsquo;회원 탈퇴&rsquo;를 통해 즉시 계정 정보(Google 고유식별자, 이메일 주소)와 모든 연계 데이터를 지체 없이 영구 파기할 수 있습니다.
                </li>
                <li>
                  <strong className="text-slate-900">Google 연동 직접 철회:</strong>{" "}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-indigo-600 font-semibold"
                  >
                    Google 계정 권한 관리 페이지
                  </a>
                  를 통해 NewsLittle 앱의 데이터 접근 권한을 외부에서 즉시 차단할 수 있습니다.
                </li>
              </ol>

              <p>
                이메일 주소는 Google 계정 인증 결과를 따르므로 서비스 내부에서 임의로 수정할 수 없습니다. Google 계정 자체의 이메일이나 보안 설정을 변경한 후 다시 로그인하면 최신 인증 상태가 반영됩니다.
              </p>

              <p>
                추가적인 개인정보 열람·삭제 요구 및 문의 사항은 개인정보 보호책임자 이메일(<a href="mailto:joonamin44@gmail.com" className="underline text-indigo-600">joonamin44@gmail.com</a>)을 통해 언제든지 접수하실 수 있습니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제9조 개인정보의 파기 절차 및 방법"
          content={
            <>
              <p>
                서비스는 개인정보 보유 기간의 경과, 처리 목적 달성, 이용자의 회원 탈퇴 또는 기록 삭제 요청 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 정보를 파기합니다.
              </p>

              <p>
                <strong>파기 절차:</strong> 이용자가 회원 탈퇴를 요청하거나 보관 기한이 만료된 경우 파기 대상 정보를 선정하고, 데이터베이스 및 캐시 저장소에서 영구 삭제합니다.
              </p>

              <p>
                <strong>파기 방법:</strong> 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없는 기술적 방법(데이터베이스 완전 삭제 쿼리 및 파티션 영구 덮어쓰기)을 사용하여 파기합니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제10조 개인정보의 안전성 확보조치"
          content={
            <>
              <p>서비스는 이용자의 개인정보가 분실·도난·유출·위조·변조 또는 훼손되지 않도록 다음과 같은 기술적·관리적 안전성 확보조치를 적용하고 있습니다.</p>

              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <strong className="text-slate-900">전송 구간 암호화 (In-Transit Encryption):</strong> 전 웹페이지 및 백엔드 REST API 통신 전 구간에 걸쳐 HTTPS 및 최신 전송 계층 보안 프로토콜(TLS 1.3)을 강제 적용하여 네트워크 패킷 감청을 원천 차단합니다.
                </li>
                <li>
                  <strong className="text-slate-900">저장 시 암호화 (At-Rest Encryption):</strong> Microsoft Azure 클라우드 데이터베이스에 저장되는 모든 영구 데이터는 스토리지 레벨에서 강력한 암호화(AES-256)가 적용되어 보관됩니다.
                </li>
                <li>
                  <strong className="text-slate-900">비밀번호 미수집 원칙:</strong> Google OAuth 2.0 표준 토큰 검증 방식을 채택하여 이용자의 계정 비밀번호를 서비스가 직접 수집하거나 처리하지 않으므로 비밀번호 유출 위험이 없습니다.
                </li>
                <li>
                  <strong className="text-slate-900">세션 보안 강화:</strong> 256비트 암호화 난수로 생성된 세션 ID를 사용하며, HttpOnly, SameSite=Lax, Secure 속성을 적용하여 XSS 및 CSRF 공격을 방어합니다.
                </li>
                <li>
                  <strong className="text-slate-900">접근 통제 및 인적 열람 제한:</strong> 최소 권한의 원칙(Least Privilege)에 따라 서버 및 데이터베이스 접근 권한을 극소화하며, 법령에 따른 요구 또는 장애 복구 이외에는 운영자를 포함한 사람의 인적 열람을 엄격히 금지합니다.
                </li>
              </ol>
            </>
          }
        />

        <PrivacyContent
          title="제11조 개인정보 보호책임자"
          content={
            <div className="rounded-xl bg-slate-50 p-5">
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[160px_1fr]">
                <dt className="font-medium text-slate-900">사업자/서비스 명칭</dt>
                <dd>NewsLittle (뉴스리틀)</dd>

                <dt className="font-medium text-slate-900">서비스 성격</dt>
                <dd>개인 비상업적 사이드 프로젝트</dd>

                <dt className="font-medium text-slate-900">
                  개인정보 보호책임자
                </dt>
                <dd>강민준 (Kang Minjun)</dd>

                <dt className="font-medium text-slate-900">직책</dt>
                <dd>개발 및 운영 총괄</dd>

                <dt className="font-medium text-slate-900">이메일 문의처</dt>
                <dd>
                  <a href="mailto:joonamin44@gmail.com" className="text-indigo-600 underline">
                    joonamin44@gmail.com
                  </a>
                </dd>
              </dl>
            </div>
          }
        />

        <PrivacyContent
          title="제12조 권익침해 구제 방법"
          content={
            <>
              <p>
                이용자는 개인정보 침해에 관한 상담 또는 분쟁 해결을 위하여
                다음 기관에 문의할 수 있습니다.
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>개인정보침해신고센터: 국번 없이 118 (privacy.kisa.or.kr)</li>
                <li>개인정보분쟁조정위원회: 국번 없이 1833-6972 (kopico.go.kr)</li>
                <li>대검찰청 사이버수사과: 국번 없이 1301 (spo.go.kr)</li>
                <li>경찰청 사이버수사국: 국번 없이 182 (ecrm.police.go.kr)</li>
              </ul>
            </>
          }
        />

        <PrivacyContent
          title="제13조 개인정보 처리방침의 변경"
          content={
            <>
              <p>
                본 개인정보 처리방침의 내용이 변경되는 경우 서비스 웹사이트 상단 공지 또는 화면을 통해 변경 일자 및 사유를 사전에 명확히 안내합니다.
              </p>
            </>
          }
        />

        {/* 제14조 영문 검수자용 Disclosure 전문 */}
        <PrivacyContent
          title="제14조 Google API Services User Data Policy Compliance (English Disclosure)"
          content={
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-6 text-[14px] leading-6 text-slate-700 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <p className="font-bold text-slate-950 text-base">
                  Google API Services User Data Policy &amp; Limited Use Disclosure
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  This section provides a formal compliance disclosure for the Google OAuth Verification Team.
                </p>
              </div>

              <div>
                <p>
                  <strong>Application Name:</strong> NewsLittle (뉴스리틀)<br />
                  <strong>Application Homepage:</strong>{" "}
                  <a href="https://newslittle.joonamin.dev" className="text-indigo-600 underline" target="_blank" rel="noreferrer">
                    https://newslittle.joonamin.dev
                  </a><br />
                  <strong>Privacy Policy URL:</strong>{" "}
                  <a href="https://newslittle.joonamin.dev/privacy" className="text-indigo-600 underline" target="_blank" rel="noreferrer">
                    https://newslittle.joonamin.dev/privacy
                  </a><br />
                  <strong>Developer / Operator:</strong> Kang Minjun (<a href="mailto:joonamin44@gmail.com" className="text-indigo-600 underline">joonamin44@gmail.com</a>)<br />
                  <strong>Project Nature:</strong> Personal, non-commercial educational side project. NewsLittle does NOT charge fees, sell user data, or display commercial third-party advertisements.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  1. Google User Data Accessed:
                </p>
                <p className="mt-1">
                  NewsLittle requests only the basic authentication scopes:{" "}
                  <code className="rounded bg-slate-200 px-1 py-0.5 text-xs text-slate-900">openid</code> and{" "}
                  <code className="rounded bg-slate-200 px-1 py-0.5 text-xs text-slate-900">email</code> (https://www.googleapis.com/auth/userinfo.email).
                  The data accessed is strictly limited to:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Google User Unique Identifier (<code className="rounded bg-slate-200 px-1 py-0.5 text-xs">sub</code>):</strong> Used solely to identify the user account, prevent duplicate registrations, and map user-selected bookmarks.</li>
                  <li><strong>Email Address (<code className="rounded bg-slate-200 px-1 py-0.5 text-xs">email</code>):</strong> Used solely to authenticate user sign-in and display the account handle in the settings screen.</li>
                </ul>
                <p className="mt-1 text-xs text-slate-600">
                  <strong>Explicit Scope Limitation:</strong> NewsLittle does NOT request or access profile pictures, names, birthdays, gender, contacts, Google Drive files, Gmail messages, Calendar events, or any other sensitive or restricted scopes.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  2. How Google User Data is Used:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>To securely authenticate and identify user accounts without collecting or storing passwords.</li>
                  <li>To maintain user login sessions and associate user-selected news topic preferences and reading archives.</li>
                  <li><strong>Prohibited Uses:</strong> NewsLittle strictly prohibits using Google user data for targeted advertising, selling to data brokers or resellers, determining credit-worthiness, lending, or any advertising/commercial resale purposes.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  3. Sharing, Transfer, and Disclosure of Google User Data:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Strict No-Sharing Policy:</strong> We do NOT sell, rent, trade, lease, or transfer Google user data to any third party under any circumstances.</li>
                  <li>Google user data is never shared with third-party advertisers, data brokers, or marketing entities.</li>
                  <li>Data is only processed by essential cloud hosting sub-processors (Microsoft Azure Korea Central for backend database/API, Cloudflare for DNS/SSL) under strict confidentiality agreements solely for technical hosting.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  4. Data Protection and Security Mechanisms:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>In-Transit Encryption:</strong> All data transmitted between clients, servers, and Google APIs is strongly encrypted using HTTPS and TLS 1.3.</li>
                  <li><strong>At-Rest Encryption:</strong> Database storage is encrypted at rest using AES-256 encryption.</li>
                  <li><strong>Human Access Restrictions:</strong> Humans are strictly prohibited from reading or inspecting Google user data unless explicit affirmative user consent is obtained, or when strictly required by law or for critical security audits.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  5. Data Retention, Deletion, and Revocation:
                </p>
                <p className="mt-1">
                  Google user data is retained only while the user maintains an active account with NewsLittle. Users have three straightforward mechanisms to delete their data or revoke permissions:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    <strong>In-App Deletion:</strong> Users can permanently delete their account and all associated data at any time via the in-app Settings page (<code className="rounded bg-slate-200 px-1 py-0.5 text-xs">/settings</code>) by clicking &ldquo;회원 탈퇴&rdquo; (Delete Account) or &ldquo;기록 삭제&rdquo; (Delete Records).
                  </li>
                  <li>
                    <strong>Direct Revocation via Google:</strong> Users can immediately revoke NewsLittle&rsquo;s access to their Google account at any time by visiting the{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-600 underline underline-offset-2"
                    >
                      Google Account Third-Party Permissions Page (https://myaccount.google.com/permissions)
                    </a>
                    .
                  </li>
                  <li>
                    <strong>Email Request:</strong> Users can email the privacy officer directly at <a href="mailto:joonamin44@gmail.com" className="text-indigo-600 underline">joonamin44@gmail.com</a> to request immediate and complete erasure of their data.
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  6. Prohibition on AI and Machine Learning (AI/ML) Model Training:
                </p>
                <p className="mt-1">
                  Google user data received from Google APIs is NOT used to develop, train, or improve non-personalized or generalized Artificial Intelligence (AI) and Machine Learning (ML) models.
                </p>
              </div>

              <div className="rounded-lg border-2 border-indigo-300 bg-white p-4 font-semibold text-indigo-950">
                &ldquo;NewsLittle&rsquo;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 text-indigo-600"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.&rdquo;
              </div>
            </div>
          }
        />

        <PrivacyContent
          title="부칙"
          content={
            <p>
              본 개인정보 처리방침은{" "}
              <strong className="font-semibold text-slate-950">
                2026년 9월 20일
              </strong>
              부터 시행합니다.
            </p>
          }
        />

        <footer className="flex items-center justify-between border-t border-slate-200 pt-10 text-sm text-slate-400">
          <span>© NewsLittle</span>
          <Link
            href="/terms"
            className="text-slate-600 underline underline-offset-4 hover:text-slate-950"
          >
            서비스 이용약관 보기
          </Link>
        </footer>
      </div>
    </main>
  );
}
