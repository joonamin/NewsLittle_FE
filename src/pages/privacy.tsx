import type { ReactNode } from "react";

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
            <p>최근 개정일: {"{{시행일}}"}</p>
            <p>시행일: {"{{시행일}}"}</p>
          </div>

          <p className="mt-7 max-w-3xl text-[15px] leading-7 text-slate-700">
            {"{{사업자_명칭}}"}(이하 “처리자”)는 NewsLittle(뉴스리틀,
            이하 “서비스”)을 운영하면서 이용자의 개인정보를 처리하는 경우
            「개인정보 보호법」 등 관계 법령을 준수합니다.
          </p>
        </header>

        <PrivacyContent
          title="제1조 목적"
          content={
            <>
              <p>
                본 개인정보 처리방침은 서비스가 Google 로그인을 제공하고 계정
                및 서비스 이용 정보를 처리하는 과정에서 어떠한 개인정보를
                수집·이용·보관·파기하는지와 이용자가 자신의 개인정보에 관하여
                행사할 수 있는 권리를 안내하기 위한 것입니다.
              </p>

              <p>
                서비스의 프론트엔드 도메인은{" "}
                <strong className="font-semibold text-slate-900">
                  {"{{앱_도메인}}"}
                </strong>
                , 백엔드 API 도메인은{" "}
                <strong className="font-semibold text-slate-900">
                  {"{{API_도메인}}"}
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
              <p>서비스는 개인정보를 다음 목적에 한하여 처리합니다.</p>

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
                        "Google 로그인 및 계정 관리",
                        "Google 계정과 서비스 계정 연동, 중복 가입 방지, 로그인한 이용자 식별",
                      ],
                      [
                        "인증 상태 확인",
                        "Google에서 이메일 인증이 완료된 계정인지 확인하고 미인증 계정의 로그인·가입 차단",
                      ],
                      [
                        "화면 표시",
                        "이메일 주소 및 표시 이름을 이용한 계정 정보 표시",
                      ],
                      [
                        "관리자 역할 판정",
                        "최초 관리자 설정을 위한 허용목록 대조 및 서버에서 부여한 역할 확인",
                      ],
                      [
                        "관심 주제 관리",
                        "이용자가 선택한 뉴스 관심 주제 저장 및 계정별 설정 유지",
                      ],
                      [
                        "서비스 기록 관리",
                        "기사 선택 기록, 퀴즈 세션·답변, 기사 노출 계측 관리 및 기록 삭제 처리",
                      ],
                      [
                        "비회원 기능 제공",
                        "비회원 랜덤 퀴즈 및 일부 신고의 소유 확인",
                      ],
                      [
                        "서비스 보호",
                        "과도한 요청을 제한하기 위한 단시간의 IP 주소 이용",
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
                서비스의 인증 수단은 Google OAuth 2.0 및 OpenID Connect이며,
                이메일·비밀번호를 이용한 별도의 회원가입이나 본인인증(CI·DI)은
                제공하지 않습니다. 최초 Google 로그인이 서비스 가입을
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
                  1. Google 로그인 및 계정 정보
                </h3>

                <p>
                  서비스가 Google 로그인 과정에서 요청하는 범위는{" "}
                  <strong className="font-semibold text-slate-900">
                    openid, email, profile
                  </strong>
                  입니다.
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
                        "Google 계정 고유식별자(sub)",
                        "Google ID 토큰",
                        "계정 연동, 중복 가입 방지, 로그인 세션 주체 식별",
                        "PostgreSQL, Redis 세션",
                      ],
                      [
                        "이메일 주소",
                        "Google ID 토큰",
                        "화면 표시, 최초 관리자 허용목록 대조, 세션 표시",
                        "PostgreSQL, Redis 세션",
                      ],
                      [
                        "이메일 인증 여부",
                        "Google ID 토큰",
                        "미인증 계정 차단 및 관리자 역할 판정 전제 확인",
                        "Redis 세션",
                      ],
                      [
                        "표시 이름",
                        "Google ID 토큰",
                        "서비스 상단 내비게이션 등 계정 이름 표시",
                        "PostgreSQL, Redis 세션",
                      ],
                      [
                        "역할(MEMBER 또는 ADMIN)",
                        "서비스 서버",
                        "계정별 권한 관리",
                        "서버 계정 정보",
                      ],
                      [
                        "관심 주제",
                        "이용자 선택 또는 최초 로그인 시 기존 비회원 설정",
                        "관심 주제 설정 유지",
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
                표시 이름은 Google 토큰의 이름을 우선 사용하며, 해당 값이 없는
                경우 이름 일부 또는 이메일 주소의 @ 앞부분을 이용합니다.
              </p>

              <p>
                재로그인 시 이메일 주소와 표시 이름은 Google 계정에서 전달된
                최신 값으로 갱신됩니다. 계정의 연속성을 판단하는 기준은 이메일
                주소가 아니라 Google 계정 고유식별자입니다.
              </p>

              <p>
                비회원 상태에서 설정한 관심 주제가 있는 경우 해당 계정에 관심
                주제를 저장한 적이 없을 때에 한하여 최초 로그인 과정에서 한 번
                계정 설정으로 반영합니다. 이미 저장된 계정의 관심 주제는
                덮어쓰지 않습니다.
              </p>

              <div className="pt-3">
                <h3 className="mb-3 font-semibold text-slate-950">
                  2. 계정 활동 정보
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
                      ["기사 선택 기록", "이용자의 기사 선택 기록 관리"],
                      ["퀴즈 세션 및 답변", "퀴즈 진행 및 결과 처리"],
                      ["기사 노출 계측", "서비스 이용 기록 관리"],
                      [
                        "신고 시 이용자가 직접 입력한 연락 경로",
                        "신고 처리",
                      ],
                      [
                        "비회원 익명 식별자",
                        "비회원 랜덤 퀴즈 및 일부 신고 소유 확인",
                      ],
                      [
                        "IP 주소",
                        "과도한 요청 방지를 위한 단시간 요율 제한",
                      ],
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
                운영환경에서는 요청 과다 방지를 위해 Cloudflare의
                CF-Connecting-IP 값을 짧은 시간 동안 이용할 수 있습니다. IP
                주소를 회원 프로필 정보로 저장하지 않습니다.
              </p>

              <p>
                주관식 퀴즈 판정 시 외부 AI에는 문항, 이용자의 답변 및 기준 답만
                전송하며 계정 식별자는 전송하지 않습니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제4조 수집하지 않는 정보"
          content={
            <>
              <p>서비스는 다음 정보를 수집하거나 계정 정보로 저장하지 않습니다.</p>

              <ul className="list-disc space-y-2 pl-5">
                <li>
                  프로필 사진, 전화번호, 생년월일, 성별, 주소, 결제정보, 기기
                  연락처
                </li>
                <li>
                  Google 프로필 정보 중 프로필 사진, 언어·지역 정보, 성 등
                  서비스가 사용하지 않는 정보
                </li>
                <li>Google 액세스 토큰 및 리프레시 토큰의 이용자 DB 저장</li>
                <li>
                  신고 화면에서 계정 이메일 주소를 신고 연락처로 자동 입력하는
                  처리
                </li>
              </ul>

              <p>
                Google 토큰에 서비스가 사용하지 않는 프로필 정보가 포함되더라도
                해당 값을 파싱하여 저장하지 않습니다.
              </p>

              <p>
                인가 코드는 Google 토큰 엔드포인트와의 일회성 교환에 사용한 뒤
                보관하지 않습니다. 서비스는 access_type=online으로 동작하며
                리프레시 토큰을 이용하지 않습니다.
              </p>

              <p>서비스는 만 14세 미만의 개인정보를 수집하지 않습니다.</p>

              <p className="text-sm text-slate-500">
                ※ 현재 이용자의 나이를 별도로 확인하는 기능은 구현되어 있지
                않습니다.
              </p>
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
                      <th className={thClassName}>정보</th>
                      <th className={thClassName}>보유 기간</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      ["계정 정보 및 관심 주제", "회원 탈퇴 시까지"],
                      [
                        "로그인 세션",
                        "유휴 30분 또는 최초 발급 후 절대 8시간까지. 로그아웃 시 즉시 삭제",
                      ],
                      ["접속 로그", "{{접속로그_보유기간}}"],
                      [
                        "탈퇴 요청 처리 이력",
                        "{{삭제요청기록_보유기간}}",
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
                데이터베이스, Redis 및 로그가 저장되는 물리적 위치 또는 클라우드
                리전은 <strong>{"{{인프라_위치}}"}</strong>입니다.
              </p>

              <p>
                기록 삭제 요청 시 계정과 관심 주제는 유지하고 기사 선택 기록,
                숏폼·랜덤 퀴즈 세션 및 기사 노출 계측 정보를 삭제합니다.
              </p>

              <p>
                회원 탈퇴 완료 시 계정 정보와 연결된 관심 주제, 선택 기록, 퀴즈
                세션 및 기사 노출 계측 정보를 함께 삭제합니다.
              </p>

              <p>
                탈퇴 요청 처리 이력은 처리 완료 후에도 별도로 유지하며 기존
                이용자 계정 식별값은 제거됩니다. 최종 파기 시점은{" "}
                <strong>{"{{삭제요청기록_보유기간}}"}</strong>입니다.
              </p>

              <p>
                탈퇴 후 동일한 Google 계정으로 다시 로그인하면 새로운 서비스
                계정이 생성되며 기존에 삭제된 기록은 복구되지 않습니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제6조 개인정보의 제3자 제공 및 처리위탁 (Google 로그인)"
          content={
            <>
              <p>
                서비스는 Google 로그인을 제공하기 위해 Google LLC의 OAuth 2.0
                및 OpenID Connect 관련 API와 통신합니다.
              </p>

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
                      <td className={tdClassName}>ID 토큰 또는 인가 코드</td>
                      <td className={tdClassName}>
                        로그인 인증 및 토큰 검증
                      </td>
                      <td className={tdClassName}>
                        Google 로그인 수행 시 네트워크를 통해 전송
                      </td>
                    </tr>

                    <tr>
                      <td className={`${tdClassName} font-medium text-slate-900`}>
                        Google LLC
                      </td>
                      <td className={tdClassName}>
                        인가 코드 교환에 필요한 클라이언트 식별정보,
                        클라이언트 비밀정보, 리디렉션 주소 및 인증 처리 유형
                      </td>
                      <td className={tdClassName}>
                        인가 코드를 ID 토큰으로 교환
                      </td>
                      <td className={tdClassName}>
                        인가 코드 로그인 시 서버 간 통신
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                이용자의 Google 비밀번호는 서비스에 전달되지 않으며 처리자가
                이를 수집하거나 저장하지 않습니다.
              </p>

              <p>
                서비스는 Google 로그인 검증 목적 외의 목적으로 이용자 데이터를
                Google에 전송하지 않습니다.
              </p>

              <p>
                Google이 자체적으로 처리하는 정보는 Google 개인정보처리방침을
                따릅니다.
              </p>

              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex font-medium text-slate-950 underline underline-offset-4"
              >
                Google 개인정보처리방침
              </a>

              <div className="rounded-lg bg-slate-50 px-4 py-4">
                <p>
                  Google 이외 호스팅·관제·CDN 등 개인정보 처리업무 수탁자:
                  <br />
                  <strong className="font-semibold text-slate-900">
                    {"{{수탁자_목록}}"}
                  </strong>
                </p>
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
                쿠키에는 이메일 주소나 표시 이름 등 개인정보 자체가 아니라 서버
                세션 정보를 조회하기 위한 256비트 난수 형태의 불투명 토큰만
                저장합니다.
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>HttpOnly</li>
                <li>SameSite=Lax</li>
                <li>운영환경에서 Secure</li>
                <li>Domain 미설정 host-only 쿠키</li>
                <li>Max-Age 미설정 브라우저 세션 쿠키</li>
              </ul>

              <p>
                서버의 Redis 세션은 마지막 요청 이후 30분 동안 이용이 없으면
                만료되며 최초 발급 후 8시간이 지나면 요청 여부와 관계없이
                만료됩니다.
              </p>

              <p>
                세션에는 Google 계정 고유식별자, 이메일 주소, 이메일 인증 여부,
                표시 이름, 발급 시각 및 절대 만료 시각이 저장됩니다. 해당
                개인정보는 브라우저 쿠키 값 자체에 저장되지 않습니다.
              </p>

              <div className="pt-3">
                <h3 className="mb-3 font-semibold text-slate-950">
                  2. 비회원 식별 쿠키
                </h3>

                <p>
                  비회원 랜덤 퀴즈 및 일부 신고 소유 확인을 위해{" "}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-900">
                    newslittle_anonymous_id
                  </code>{" "}
                  쿠키를 사용합니다.
                </p>
              </div>

              <p>
                해당 값은 UUID 기반의 임의 식별값으로 최대 64자이며 유효기간은
                7일입니다. HttpOnly, SameSite=Lax 속성을 적용하고 HTTPS
                환경에서는 Secure 속성을 적용합니다.
              </p>

              <p>
                이용자는 브라우저 설정을 통해 쿠키 저장을 제한하거나 삭제할 수
                있습니다. 다만 로그인 세션 쿠키를 차단하는 경우 로그인 상태를
                유지할 수 없으며, 비회원 식별 쿠키를 차단하면 이에 의존하는
                일부 기능이 제한될 수 있습니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제8조 정보주체의 권리·의무 및 행사 방법"
          content={
            <>
              <p>
                이용자는 관계 법령에서 정하는 범위에서 개인정보의 열람, 정정,
                삭제 및 처리정지 등을 요구할 수 있습니다.
              </p>

              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <strong className="text-slate-900">계정 정보 열람:</strong>{" "}
                  이메일 주소, 표시 이름, 역할, 관심 주제 및 삭제 요청 상태를
                  확인할 수 있습니다.
                </li>
                <li>
                  <strong className="text-slate-900">관심 주제 정정:</strong>{" "}
                  서비스 설정에서 관심 주제를 변경할 수 있습니다.
                </li>
                <li>
                  <strong className="text-slate-900">회원 탈퇴:</strong>{" "}
                  설정 화면에서 확인 절차를 거쳐 탈퇴를 요청할 수 있으며 완료
                  시 현재 로그인 세션도 삭제됩니다.
                </li>
                <li>
                  <strong className="text-slate-900">기록 삭제:</strong>{" "}
                  계정은 유지하면서 기사 선택 기록, 퀴즈 세션 및 기사 노출 계측
                  정보를 삭제할 수 있습니다.
                </li>
              </ol>

              <p>
                동일한 종류의 삭제 요청이 이미 처리 중이면 중복 요청은
                접수하지 않습니다.
              </p>

              <p>
                이메일 주소와 표시 이름은 Google 프로필 정보를 따르므로 서비스
                내부에서 직접 수정하는 기능은 제공하지 않습니다. Google 계정
                정보를 변경한 후 다시 로그인하면 최신 정보가 반영됩니다.
              </p>

              <p>
                서비스에서 별도 기능으로 제공되지 않는 개인정보 열람·전송 요구
                및 보관 정보에 관한 문의는 개인정보 보호책임자 이메일을 통해
                행사할 수 있습니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제9조 개인정보의 파기 절차 및 방법"
          content={
            <>
              <p>
                개인정보의 보유기간이 종료되거나 이용자의 회원 탈퇴 또는 기록
                삭제 요청 등으로 개인정보가 불필요하게 된 경우 해당 정보를
                파기합니다.
              </p>

              <p>
                회원 탈퇴가 완료되면 계정 정보를 삭제하고 해당 계정과 연결된
                관심 주제, 기사 선택 기록, 퀴즈 세션 및 기사 노출 계측 정보를
                함께 삭제합니다.
              </p>

              <p>
                로그아웃 시 서버의 로그인 세션과 브라우저 로그인 세션 쿠키를
                삭제합니다. 로그아웃하지 않은 경우에도 유휴 30분 또는 절대
                8시간 만료 기준에 따라 서버 세션이 자동 만료됩니다.
              </p>

              <p>
                전자적 형태의 개인정보는 해당 저장소에서 삭제하는 방식으로
                파기합니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제10조 개인정보의 안전성 확보조치"
          content={
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                로그인 세션 쿠키에 HttpOnly, SameSite=Lax 및 운영환경 Secure
                속성을 적용합니다.
              </li>
              <li>
                쿠키에 개인정보를 직접 저장하지 않고 서버 저장소의 세션을
                조회하는 방식으로 관리합니다.
              </li>
              <li>로그인 시마다 새로운 임의 세션 토큰을 발급합니다.</li>
              <li>
                운영환경에서는 지정된 프론트엔드 출처에 대해서만 자격 증명이
                포함된 CORS 요청을 허용합니다.
              </li>
              <li>
                로그인 및 로그아웃 요청에 동일 출처 검사와 일정 시간 동안의
                요청 횟수 제한을 적용합니다.
              </li>
              <li>
                이용자의 비밀번호를 직접 수집하거나 저장하지 않고 Google
                인증을 이용합니다.
              </li>
              <li>
                관리자 전용 API에 비관리자가 접근할 경우 관리자 기능의 존재
                여부가 불필요하게 노출되지 않도록 응답합니다.
              </li>
            </ol>
          }
        />

        <PrivacyContent
          title="제11조 개인정보 보호책임자"
          content={
            <div className="rounded-xl bg-slate-50 p-5">
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[160px_1fr]">
                <dt className="font-medium text-slate-900">사업자 명칭</dt>
                <dd>{"{{사업자_명칭}}"}</dd>

                <dt className="font-medium text-slate-900">사업자 주소</dt>
                <dd>{"{{사업자_주소}}"}</dd>

                <dt className="font-medium text-slate-900">
                  개인정보 보호책임자
                </dt>
                <dd>{"{{성명}}"}</dd>

                <dt className="font-medium text-slate-900">직책</dt>
                <dd>{"{{직책}}"}</dd>

                <dt className="font-medium text-slate-900">이메일</dt>
                <dd>{"{{이메일}}"}</dd>

                <dt className="font-medium text-slate-900">전화</dt>
                <dd>{"{{전화}}"}</dd>
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
                <li>개인정보침해신고센터: 국번 없이 118</li>
                <li>개인정보분쟁조정위원회: 1833-6972</li>
                <li>개인정보보호위원회: 개인정보 보호 관련 제도 및 권리구제 안내</li>
              </ul>

              <p>
                그 밖에 개인정보 침해와 관련하여 관계 법령에 따른 수사기관 또는
                법원 등에 권리구제를 신청할 수 있습니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="제13조 개인정보 처리방침의 변경"
          content={
            <>
              <p>
                본 개인정보 처리방침의 내용이 변경되는 경우 처리자는 변경
                내용과 시행일을 서비스 화면 등을 통하여 공개합니다.
              </p>

              <p>
                개인정보의 수집·이용 목적, 처리 항목, 제3자 제공 등 이용자의
                권리에 중요한 영향을 미치는 사항이 변경되는 경우 관계 법령에서
                정한 방법과 절차에 따라 안내합니다.
              </p>
            </>
          }
        />

        <PrivacyContent
          title="부칙"
          content={
            <p>
              본 개인정보 처리방침은{" "}
              <strong className="font-semibold text-slate-950">
                {"{{시행일}}"}
              </strong>
              부터 시행합니다.
            </p>
          }
        />

        <footer className="pt-10 text-sm text-slate-400">
          © NewsLittle
        </footer>
      </div>
    </main>
  );
}

