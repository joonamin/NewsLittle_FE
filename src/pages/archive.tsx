import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function ArchivePage() {
  return (
    <RoutePlaceholder
      eyebrow="SCR-07"
      title="아카이브"
      description="회원이 보관한 뉴스 목록을 날짜별로 확인하는 화면입니다."
      notes={["비로그인 접근 시 로그인 모달을 띄우는 정책은 인증 연동과 함께 구현합니다."]}
    />
  );
}
