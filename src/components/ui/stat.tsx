// lib: Stat Pair / 값과 라벨 (aemf3), Stat Card / 지표 카드 (dpVYL)
import Link from "next/link";
import type { ReactNode } from "react";

export type StatPairProps = {
  value: string | number;
  label: string;
};

export function StatPair({ value, label }: StatPairProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <p className="text-[28px] leading-[1.5] text-nl-accent font-bold">{value}</p>
      <p className="text-nl-caption text-nl-muted font-normal">{label}</p>
    </div>
  );
}

export type StatCardProps = {
  label: string;
  value: string | number;
  href?: string;
  onOpen?: () => void;
};

function StatCardBody({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-nl-card border border-nl-border bg-nl-bg p-6 text-left transition-colors group-hover:bg-nl-subtle">
      <p className="text-nl-micro text-nl-muted font-normal">{label}</p>
      <p className="text-[24px] leading-[1.5] text-nl-text font-bold">{value}</p>
    </div>
  );
}

export function StatCard({ label, value, href, onOpen }: StatCardProps) {
  if (href) {
    return (
      <Link href={href} className="group block w-full">
        <StatCardBody label={label} value={value} />
      </Link>
    );
  }

  return (
    <button type="button" className="group block w-full" onClick={onOpen}>
      <StatCardBody label={label} value={value} />
    </button>
  );
}
