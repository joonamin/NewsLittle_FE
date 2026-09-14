import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function SettingsPage() {
  return (
    <RoutePlaceholder
      eyebrow="SCR-09"
      title="설정"
      description="관심 주제와 회원 계정 설정을 관리하는 화면입니다."
      notes={["비회원은 관심 주제만 설정할 수 있도록 인증 연동 시 구분합니다."]}
    />
  );
}
