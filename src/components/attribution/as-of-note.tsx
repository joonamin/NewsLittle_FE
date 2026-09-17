import { cn } from "@/lib/cn";

import { attributionCopy } from "./copy";

/**
 * 랜덤 문항·해설(SCR-11·12)처럼 시점에 따라 바뀔 수 있는 정보를 다룰 때,
 * 요약 카드 또는 해설 블록에 필요 시 덧붙이는 기준 시점 표시.
 */
export type AsOfNoteProps = {
  label: string;
  className?: string;
};

export function AsOfNote({ label, className }: AsOfNoteProps) {
  return <p className={cn("text-nl-micro text-nl-muted", className)}>{attributionCopy.asOfLabel(label)}</p>;
}
