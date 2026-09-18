import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // 관리자 진입 시 기본으로 최우선 핵심 화면인 ADM-03 검수 대기열로 이동
    void router.replace("/admin/review");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 text-center text-sm text-nl-muted">
      관리자 검수 대기열로 이동하는 중입니다...
    </div>
  );
}
