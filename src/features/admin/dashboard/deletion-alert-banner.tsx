import Link from "next/link";
import { AlertOctagon, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeletionAlertBannerProps = {
  hasFailure: boolean;
  count: number;
  message: string;
};

export function DeletionAlertBanner({
  hasFailure,
  count,
  message,
}: DeletionAlertBannerProps) {
  if (!hasFailure || count <= 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/80 px-6 py-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <AlertOctagon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-700">{message}</p>
          <p className="text-xs text-red-500">
            삭제 실패 자산은 저작권 침해 방지를 위해 즉시 격리 및 상태 확인이 필요합니다.
          </p>
        </div>
      </div>

      <Link href="/admin/deletion-expiry">
        <Button size="xs" variant="secondary" className="border-red-300 text-red-700 hover:bg-red-100">
          <span>삭제 상태 확인</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
