import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PrivacyPage() {
  return (
    <RoutePlaceholder
      eyebrow="COM-08"
      title="개인정보 처리방침"
      description="관심 주제·보관 기록의 처리 목적과 보관 기간, 처리위탁·국외 이전 현황을 안내하는 화면입니다."
      notes={["설정(SCR-09) 화면의 개인정보 처리 안내 링크가 연결되는 위치입니다.", "세부 조항은 IA·PRD 확정 후 채웁니다."]}
    />
  );
}
