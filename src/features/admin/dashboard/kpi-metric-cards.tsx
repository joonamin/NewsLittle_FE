import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/cn";

type KpiMetricCardsProps = {
  pendingCounts: {
    reviewPendingCount: number;
    usageBasisPendingCount: number;
    deletionFailureCount: number;
    unprocessedReportCount: number;
    correctionPendingCount: number;
  };
};

export function KpiMetricCards({ pendingCounts }: KpiMetricCardsProps) {
  const cards = [
    {
      id: "review",
      label: "검수 대기",
      count: pendingCounts.reviewPendingCount,
      href: "/admin/review",
      highlight: pendingCounts.reviewPendingCount > 0,
      badge: "ADM-03",
    },
    {
      id: "usage-basis",
      label: "이용 근거 검토",
      count: pendingCounts.usageBasisPendingCount,
      href: "/admin/usage-basis",
      highlight: pendingCounts.usageBasisPendingCount > 0,
      badge: "ADM-02",
    },
    {
      id: "deletion-failure",
      label: "삭제 실패",
      count: pendingCounts.deletionFailureCount,
      href: "/admin/deletion-expiry",
      highlight: pendingCounts.deletionFailureCount > 0,
      isDanger: pendingCounts.deletionFailureCount > 0,
      badge: "ADM-05",
    },
    {
      id: "reports",
      label: "미처리 신고",
      count: pendingCounts.unprocessedReportCount,
      href: "/admin/reports",
      highlight: pendingCounts.unprocessedReportCount > 0,
      badge: "ADM-06",
    },
    {
      id: "correction",
      label: "정정 대기",
      count: pendingCounts.correctionPendingCount,
      href: "/admin/publish",
      highlight: pendingCounts.correctionPendingCount > 0,
      badge: "ADM-04",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          className={cn(
            "group relative flex flex-col justify-between rounded-xl border p-5 transition-all bg-nl-surface shadow-2xs hover:shadow-xs",
            card.isDanger
              ? "border-red-200 hover:border-red-400 bg-red-50/20"
              : "border-nl-border hover:border-nl-accent"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-nl-muted group-hover:text-nl-text transition-colors">
              {card.label}
            </span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-nl-muted bg-nl-subtle">
              {card.badge}
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span
              className={cn(
                "text-3xl font-bold font-mono tracking-tight",
                card.isDanger
                  ? "text-red-600"
                  : "text-nl-accent group-hover:text-nl-accent-hover"
              )}
            >
              {card.count}
            </span>
            <span className="flex items-center text-xs font-semibold text-nl-muted group-hover:text-nl-accent transition-colors">
              <span className="mr-0.5">이동</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
