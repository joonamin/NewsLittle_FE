import { useState, type ReactNode } from "react";
import { AlertCircle, ClipboardList } from "lucide-react";

import type { AdminAuditLog } from "@/features/contracts/admin-models";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";

export function AdminPageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-6 border-b border-nl-border pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-nl-text">{title}</h1>
        <p className="mt-1 text-xs text-nl-muted">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const toneByStatus: Record<string, string> = {
  CONDITIONAL: "bg-nl-positive-subtle text-nl-positive",
  PUBLISHED: "bg-nl-positive-subtle text-nl-positive",
  CONFIRMED: "bg-nl-positive-subtle text-nl-positive",
  RESOLVED: "bg-nl-positive-subtle text-nl-positive",
  FAILED: "bg-nl-negative-subtle text-nl-negative",
  SUSPENDED: "bg-nl-negative-subtle text-nl-negative",
  WITHDRAWN: "bg-nl-negative-subtle text-nl-negative",
  REJECTED: "bg-nl-negative-subtle text-nl-negative",
  HOLDING: "bg-amber-100 text-amber-800",
  EXPIRED: "bg-amber-100 text-amber-800",
  PENDING: "bg-amber-100 text-amber-800",
  RECEIVED: "bg-amber-100 text-amber-800",
};

export function AdminStatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold", toneByStatus[status] ?? "bg-nl-subtle text-nl-muted")}>{label ?? status}</span>;
}

export function AdminLoading() {
  return <div className="flex min-h-[360px] items-center justify-center gap-3 rounded-xl border border-nl-border bg-nl-surface"><Spinner className="h-6 w-6" /><span className="text-sm text-nl-muted">운영 데이터를 불러오는 중입니다...</span></div>;
}

export function AdminError({ onRetry }: { onRetry: () => void }) {
  return <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-nl-border bg-nl-surface"><AlertCircle className="h-8 w-8 text-nl-negative" /><p className="text-sm font-semibold text-nl-text">운영 데이터를 불러오지 못했습니다.</p><Button size="xs" variant="secondary" onClick={onRetry}>다시 시도</Button></div>;
}

export function AdminEmptyState({ title = "표시할 항목이 없습니다." }: { title?: string }) {
  return <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-nl-border bg-nl-surface"><ClipboardList className="h-8 w-8 text-nl-muted" /><p className="text-sm text-nl-muted">{title}</p></div>;
}

export function AuditLog({ logs }: { logs: AdminAuditLog[] }) {
  return (
    <section className="rounded-xl border border-nl-border bg-nl-surface p-5">
      <h2 className="text-sm font-bold text-nl-text">처리 기록</h2>
      <p className="mt-1 text-[11px] text-nl-muted">운영 기록은 수정하거나 삭제할 수 없습니다.</p>
      <div className="mt-3 divide-y divide-nl-border">
        {logs.length ? logs.map((log) => <div key={log.id} className="grid grid-cols-[150px_120px_1fr] gap-3 py-2 text-xs"><span className="text-nl-muted">{log.createdAt}</span><span className="font-semibold text-nl-text">{log.actor} · {log.action}</span><span className="text-nl-muted">{log.reason}</span></div>) : <p className="py-4 text-xs text-nl-muted">아직 처리 기록이 없습니다.</p>}
      </div>
    </section>
  );
}

export function ConfirmActionModal({ open, title, description, confirmLabel, pending, reasonRequired = true, onClose, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; pending?: boolean; reasonRequired?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const close = () => { setReason(""); onClose(); };
  return <Modal open={open} onClose={close} title={title} size="compact" footer={<div className="flex justify-end gap-3"><Button variant="secondary" size="s" onClick={close}>취소</Button><Button size="s" disabled={pending || (reasonRequired && !reason.trim())} onClick={() => onConfirm(reason.trim())}>{pending ? "처리 중..." : confirmLabel}</Button></div>}><p className="text-sm leading-6 text-nl-muted">{description}</p>{reasonRequired ? <label className="text-xs font-semibold text-nl-text">처리 사유 · 필수<textarea aria-label="처리 사유" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-nl-border bg-nl-bg p-3 text-sm font-normal outline-none focus:border-nl-accent" placeholder="판단 근거와 처리 사유를 입력하세요." /></label> : null}<p className="text-[11px] text-nl-muted">실행 계정과 시각이 감사 로그에 자동 기록됩니다.</p></Modal>;
}

export const adminInputClass = "h-10 rounded-lg border border-nl-border bg-nl-bg px-3 text-xs text-nl-text outline-none focus:border-nl-accent";
export const adminPanelClass = "rounded-xl border border-nl-border bg-nl-surface";
