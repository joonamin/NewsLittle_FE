import type { DashboardActivityLog } from "@/features/contracts/admin-models";
import { cn } from "@/lib/cn";

type RecentActivityTableProps = {
  activities: DashboardActivityLog[];
};

function getActionBadgeClass(action: string) {
  if (action.includes("통과") || action.includes("승인")) {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (action.includes("게시")) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (action.includes("삭제") || action.includes("반려")) {
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (action.includes("정정") || action.includes("신고")) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  return "bg-nl-subtle text-nl-text border-nl-border";
}

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
  return (
    <div className="rounded-xl border border-nl-border bg-nl-surface p-6 shadow-2xs">
      <div className="flex items-center justify-between border-b border-nl-border pb-3">
        <h3 className="text-base font-bold text-nl-text">
          최근 처리 기록 <span className="text-sm font-normal text-nl-muted">· {activities.length}건</span>
        </h3>
        <span className="text-xs text-nl-muted">실시간 감사 추적 로그</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-nl-border bg-nl-subtle/60 text-xs font-semibold text-nl-muted">
              <th className="py-2.5 px-4 w-[120px]">시각</th>
              <th className="py-2.5 px-4 w-[180px]">대상 자산</th>
              <th className="py-2.5 px-4 w-[160px]">조치</th>
              <th className="py-2.5 px-4">행위자</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nl-border/60">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-nl-subtle/40 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-nl-muted">
                  {activity.time}
                </td>
                <td className="py-3 px-4 font-mono font-medium text-xs text-nl-text">
                  {activity.assetCode}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold border",
                      getActionBadgeClass(activity.action)
                    )}
                  >
                    {activity.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-nl-muted">
                  {activity.actor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
