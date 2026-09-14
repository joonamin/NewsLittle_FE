import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function RandomQuizStartPage() {
  return (
    <RoutePlaceholder
      eyebrow="SCR-10"
      title="랜덤 퀴즈 시작"
      description="서비스가 고른 뉴스로 랜덤 퀴즈 회차를 시작하는 화면입니다."
      notes={["비회원도 시작할 수 있으며, 실제 회차 생성은 백엔드가 담당합니다."]}
    />
  );
}
