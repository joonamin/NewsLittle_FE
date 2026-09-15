// lib: Table / Header Row (h46F8), Table / Data Row (wAiVB)
import type { ReactNode, TableHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type TableProps = TableHTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps) {
  return <table className={cn("w-full border-collapse", className)} {...props} />;
}

export type TableHeaderRowProps = {
  columns: readonly ReactNode[];
};

export function TableHeaderRow({ columns }: TableHeaderRowProps) {
  return (
    <tr className="border-b border-nl-border bg-nl-subtle">
      {columns.map((column, index) => (
        <th
          key={index}
          scope="col"
          className="px-4 py-2.5 text-left text-[13px] leading-[1.5] text-nl-muted font-bold"
        >
          {column}
        </th>
      ))}
    </tr>
  );
}

export type TableDataRowProps = {
  cells: readonly ReactNode[];
  onSelect?: () => void;
};

export function TableDataRow({ cells, onSelect }: TableDataRowProps) {
  return (
    <tr
      className={cn("border-b border-nl-border bg-nl-bg", onSelect ? "cursor-pointer" : undefined)}
      onClick={onSelect}
    >
      {cells.map((cell, index) => (
        <td key={index} className="px-4 py-2.5 text-left text-[13px] leading-[1.5] text-nl-text font-normal">
          {cell}
        </td>
      ))}
    </tr>
  );
}
