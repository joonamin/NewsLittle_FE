import type { ReactNode } from "react";
import Link from "next/link";

function TermsContent({
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

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
        {/* Header */}
        <header className="mb-10 border-b border-slate-900 pb-10">
          <p className="mb-3 text-sm font-medium text-slate-500">
            NewsLittle
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            서비스 이용약관
          </h1>

          <div className="mt-6 space-y-1 text-sm leading-6 text-slate-500">
            <p>최근 개정일: 2026년 9월 20일</p>
            <p>시행일: 2026년 9월 20일</p>
          </div>

          <p className="mt-7 max-w-3xl text-[15px] leading-7 text-slate-700">
            NewsLittle(뉴스리틀, 이하 “서비스”)을 이용해 주셔서 감사합니다.
            본 약관은 서비스가 제공하는 뉴스 탐색, AI 요약, 숏폼 및 랜덤 퀴즈,
            아카이브 등 제반 서비스의 이용과 관련하여 서비스와 이용자 간의 권리,
            의무 및 책임사항을 규정합니다.
          </p>
        </header>

        <TermsContent
          title="제1조 목적"
          content={
            <p>
              본 약관은 NewsLittle이 제공하는 웹 애플리케이션 서비스의 이용조건
              및 절차, 서비스와 회원 및 비회원 간의 권리·의무, 책임사항 및
              기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          }
        />

        <TermsContent
          title="제2조 용어의 정의"
          content={
            <>
              <p>본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>용어</th>
                      <th className={thClassName}>정의 및 설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "서비스",
                        "NewsLittle이 웹 브라우저를 통해 제공하는 뉴스 요약, 퀴즈 출제·판정, 아카이브 등의 제반 기능",
                      ],
                      [
                        "이용자",
                        "서비스에 접속하여 본 약관에 따라 서비스를 이용하는 회원 및 비회원",
                      ],
                      [
                        "회원",
                        "Google OAuth 2.0 계정 연동을 통해 서비스에 가입하여 회원 전용 기능을 이용하는 자",
                      ],
                      [
                        "비회원",
                        "로그인하지 않고 홈 뉴스 탐색, 랜덤 퀴즈 풀이 등 비회원 허용 기능을 이용하는 자",
                      ],
                      [
                        "뉴스 숏폼 / 요약",
                        "기사 본문을 토대로 인공지능(AI)이 핵심을 간추린 요약 텍스트 및 관련 설명 이미지",
                      ],
                      [
                        "오늘 목록",
                        "회원이 홈 또는 랜덤 퀴즈 해설 카드에서 오늘 풀이하거나 살펴보기 위해 선택(담기)한 기사 목록",
                      ],
                      [
                        "아카이브",
                        "회원이 관심 기사에 다시 접근하기 위해 보관한 기사 제목과 원문 링크 등 최소 메타데이터 목록",
                      ],
                      [
                        "숏폼 퀴즈",
                        "회원이 '오늘 목록'에 담은 기사들을 바탕으로 기사당 1문제씩 출제되는 맞춤형 퀴즈 세션",
                      ],
                      [
                        "랜덤 퀴즈",
                        "서비스의 적격 뉴스 풀에서 임의로 선정된 기사들로 5문제가 구성되는 퀴즈 세션 (비회원 이용 가능)",
                      ],
                    ].map(([term, description]) => (
                      <tr key={term}>
                        <td className={`${tdClassName} font-medium text-slate-900`}>
                          {term}
                        </td>
                        <td className={tdClassName}>{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          }
        />

        <TermsContent
          title="제3조 약관의 효력 및 변경"
          content={
            <>
              <p>
                1. 본 약관은 서비스 화면에 게시하거나 링크를 제공함으로써 효력이
                발생합니다.
              </p>
              <p>
                2. 서비스는 관계 법령을 위배하지 않는 범위 내에서 본 약관을 개정할
                수 있습니다. 약관이 개정되는 경우 변경 사항과 적용 일자를 명시하여
                적용일 7일 전부터 서비스 화면을 통해 공지합니다.
              </p>
              <p>
                3. 회원이 개정 약관의 적용에 동의하지 않는 경우 회원 탈퇴를 요청할
                수 있으며, 개정 약관의 효력 발생일 이후에도 서비스를 계속 이용하는
                경우 약관의 변경 사항에 동의한 것으로 간주합니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제4조 회원가입 및 인증"
          content={
            <>
              <p>
                1. 서비스는 이용자의 가입 편의와 개인정보 최소 수집을 위해 Google
                OAuth 2.0 및 OpenID Connect를 단일 인증 수단으로 사용합니다.
              </p>
              <p>
                2. 서비스는 별도의 아이디·비밀번호 입력 가입 폼이나 주민등록번호를
                이용한 본인인증(CI·DI)을 요구하지 않으며, 최초 Google 로그인이
                성공적으로 완료되면 서비스 가입이 이루어집니다.
              </p>
              <p>
                3. 회원은 자신의 Google 계정 접근 권한을 안전하게 관리할 책임이
                있으며, 타인에게 양도하거나 대여할 수 없습니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제5조 서비스의 제공 및 구분"
          content={
            <>
              <p>서비스는 회원과 비회원에게 다음과 같이 기능을 구분하여 제공합니다.</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>구분</th>
                      <th className={thClassName}>제공 기능 범위</th>
                      <th className={thClassName}>데이터 저장 위치</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`${tdClassName} font-medium text-slate-900`}>
                        비회원
                      </td>
                      <td className={tdClassName}>
                        홈 뉴스 탐색, 랜덤 퀴즈(5문제 풀이 및 해설 열람), 오류·권리
                        신고, 브라우저 관심 주제 설정
                      </td>
                      <td className={tdClassName}>
                        로컬 브라우저 저장소 (쿠키/스토리지)
                      </td>
                    </tr>
                    <tr>
                      <td className={`${tdClassName} font-medium text-slate-900`}>
                        회원
                      </td>
                      <td className={tdClassName}>
                        기사 담기(오늘 목록 편성), 숏폼 퀴즈 풀이, 아카이브 보관 및
                        관리, 계정 연동 관심 주제 저장, 기록 삭제 및 회원 탈퇴 요청
                      </td>
                      <td className={tdClassName}>
                        서비스 계정 데이터베이스 (PostgreSQL/Redis)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                비회원이 회원 전용 기능(기사 담기, 숏폼 퀴즈, 아카이브 등)을 시도할
                경우 로그인 안내 모달이 표시되며, 로그인 완료 시 시도했던 동작이
                이어서 처리됩니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제6조 뉴스 콘텐츠 및 지식재산권"
          content={
            <>
              <p>
                1. 서비스에서 인용 및 요약되는 기사의 원 저작권은 해당 기사를
                작성한 언론사 및 원 저작자에게 있습니다.
              </p>
              <p>
                2. 서비스는 허용된 이용 근거(계약·라이선스 또는 공정이용 개별
                검토)를 바탕으로 기사를 처리하며, 모든 뉴스 카드와 퀴즈 해설 화면에
                매체명, 원문 게시일, 원문 접근 링크, AI 요약 여부를 명확히
                표시합니다.
              </p>
              <p>
                3. 서비스가 독자적으로 생성한 AI 요약문, 퀴즈 문항, 해설, 생성
                이미지 및 UI 디자인에 대한 지식재산권은 서비스에 귀속됩니다.
              </p>
              <p>
                4. 이용자는 서비스를 통해 얻은 정보를 서비스의 사전 승낙 없이 복제,
                출판, 전송, 배포, 방송 기타 방법에 의해 영리 목적으로 이용하거나
                제3자에게 제공할 수 없습니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제7조 데이터 보관 상한 및 삭제 정책 (COM-03)"
          content={
            <>
              <p>
                서비스는 저작권 보호와 데이터 최소 수집 원칙에 따라 정해진 보관
                상한을 엄격히 준수합니다.
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className={tableClassName}>
                  <thead>
                    <tr>
                      <th className={thClassName}>데이터 항목</th>
                      <th className={thClassName}>보관 목적</th>
                      <th className={thClassName}>보관 상한 및 삭제 조건</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "수집한 기사 본문",
                        "요약·출제 및 운영 검수",
                        "요약·출제 완료 시 또는 최초 수집일로부터 최대 7일 이내 삭제",
                      ],
                      [
                        "AI 요약·문항·답안·해설·이미지",
                        "뉴스 숏폼 제공 및 퀴즈 풀이",
                        "원문 기사 게시일로부터 최대 30일 보관 후 삭제",
                      ],
                      [
                        "오늘 목록 및 이전 미처리 목록",
                        "당일 탐색 및 숏폼 퀴즈 대상 관리",
                        "사용자가 목록에서 제거하거나 버리기 선택 시 즉시 삭제",
                      ],
                      [
                        "아카이브 기록",
                        "관심 기사 재접근 수단 제공",
                        "기사 제목과 원문 링크만 보관 (본문·AI 요약은 영구 보관하지 않음). 이용자 삭제 또는 탈퇴 시 즉시 삭제",
                      ],
                      [
                        "비회원 브라우저 데이터",
                        "관심 주제 참고 및 랜덤 퀴즈 쿨다운",
                        "브라우저 범위 내에서만 유지되며 브라우저 캐시/데이터 삭제 시 폐기",
                      ],
                    ].map(([category, purpose, rule]) => (
                      <tr key={category}>
                        <td className={`${tdClassName} font-medium text-slate-900`}>
                          {category}
                        </td>
                        <td className={tdClassName}>{purpose}</td>
                        <td className={tdClassName}>{rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                회원은 서비스 설정 화면에서 언제든지 &lsquo;기록 삭제&rsquo;를 요청하여 오늘
                목록과 아카이브 기록을 일괄 삭제할 수 있으며, &lsquo;회원 탈퇴&rsquo;를 통해
                계정 및 연동 데이터를 영구 삭제할 수 있습니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제8조 인공지능(AI) 기술의 활용 및 고지 (COM-04)"
          content={
            <>
              <p>
                1. 서비스는 기사 핵심 요약, 설명 이미지 생성, 퀴즈 문항 출제 및
                주관식 답변 판정 보조를 위해 생성형 AI 기술을 활용합니다.
              </p>
              <p>
                2. AI가 생성한 이미지 및 콘텐츠에는 이용자가 실제 원문 사진 등으로
                오인하지 않도록 AI 생성 식별 표시를 제공합니다.
              </p>
              <p>
                3. 이용자의 주관식 답변 내용 및 뉴스 원문은 외부 AI 제공자의 모델
                학습이나 파인튜닝 목적으로 재이용되지 않습니다.
              </p>
              <p>
                4. AI의 자동 생성 및 판정 결과는 기술적 특성상 사실과 다르거나
                부정확할 수 있으며, 서비스는 이를 보완하기 위해 이용자 신고 접수 및
                운영 검수 절차를 지속적으로 운영합니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제9조 오류·권리 침해 신고 및 대응 (COM-07)"
          content={
            <>
              <p>
                1. 이용자는 서비스 내 콘텐츠에 대해 다음 4가지 유형으로 신고할 수
                있습니다.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-slate-900">내용 오류:</strong> 기사 요약
                  또는 문항 정보가 사실과 다른 경우
                </li>
                <li>
                  <strong className="text-slate-900">판정 오류:</strong> 주관식 퀴즈
                  정답 판정에 오판이 있는 경우
                </li>
                <li>
                  <strong className="text-slate-900">권리 침해:</strong> 저작권 등
                  권리가 침해되었다고 판단되는 경우
                </li>
                <li>
                  <strong className="text-slate-900">원문 접근 실패:</strong> 원문
                  언론사 기사 링크가 올바르게 열리지 않는 경우
                </li>
              </ul>
              <p>
                2. 구체적인 권리 침해 신고가 접수되는 경우 서비스는 관련 콘텐츠의
                노출 및 출제를 우선 보류하고 검토 후 적절한 조치를 취합니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제10조 서비스 제공의 중단 및 면책"
          content={
            <>
              <p>
                1. 서비스는 시스템 점검, 교체, 네트워크 장애 등 불가피한 사유가
                발생한 경우 서비스 제공을 일시적으로 중단할 수 있습니다.
              </p>
              <p>
                2. 서비스는 원문 언론사의 사이트 개편, 폐쇄 또는 기사 삭제로 인해
                원문 링크 접근이 실패하는 것에 대해 책임을 지지 않습니다.
              </p>
              <p>
                3. 서비스가 제공하는 AI 요약과 퀴즈는 정보 습득과 학습 보조를 위한
                참고자료이며, 서비스는 콘텐츠의 완전성이나 특정 목적에의 적합성을
                보증하지 않습니다.
              </p>
              <p>
                4. 서비스는 천재지변, 불가항력적 사유 또는 통제할 수 없는 제3자
                서비스(Google 인증, 클라우드 인프라 등)의 장애로 인한 손해에 대하여
                책임을 부담하지 않습니다.
              </p>
            </>
          }
        />

        <TermsContent
          title="제11조 준거법 및 관할 법원"
          content={
            <p>
              본 약관의 해석 및 서비스 이용과 관련하여 서비스와 이용자 간에 발생한
              분쟁에 대해서는 대한민국 법률을 준거법으로 하며, 소송이 제기되는 경우
              민사소송법에 따른 관할 법원을 관할 법원으로 합니다.
            </p>
          }
        />

        <TermsContent
          title="부칙"
          content={
            <p>
              본 약관은{" "}
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
            href="/privacy"
            className="text-slate-600 underline underline-offset-4 hover:text-slate-950"
          >
            개인정보 처리방침 보기
          </Link>
        </footer>
      </div>
    </main>
  );
}
