import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function HomePage() {
  return (
    <RoutePlaceholder
      eyebrow="SCR-01"
      title="뉴스 탐색"
      description="오늘의 뉴스 피드와 회원의 오늘 목록을 보여줄 홈 화면입니다."
      notes={[
        "오늘 목록과 이전 목록 처리는 홈 위의 오버레이로 추가합니다.",
        "비회원의 기사 선택 시 로그인 모달을 표시합니다.",
      ]}
    />
  );
}
