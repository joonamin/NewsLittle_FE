import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function QuizStartPage() {
  return (
    <RoutePlaceholder
      eyebrow="SCR-03"
      title="숏폼 퀴즈 시작"
      description="오늘 목록에서 고른 기사로 퀴즈 회차를 시작하는 화면입니다."
      notes={["회원 인증과 회차 생성 API 계약이 확정되면 연결합니다."]}
    />
  );
}
