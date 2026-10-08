"use client";

import { useMemo, useState, type ReactNode } from "react";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number; // makes the column sortable
  className?: string;
}

interface DataTableProps<T> {
  caption: string; // read by screen readers
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string | number;
  pageSize?: number;
  initialSort?: { key: string; dir: "asc" | "desc" };
  onRowClick?: (row: T) => void; // mouse convenience; keep a real link or button in the row too
  empty?: ReactNode;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  pageSize = 10,
  initialSort,
  onRowClick,
  empty,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key);
    if (!column?.sortValue || !sort) return rows;
    const value = column.sortValue;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      return x < y ? -sign : x > y ? sign : 0;
    });
  }, [rows, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * pageSize, (current + 1) * pageSize);

  const toggleSort = (key: string) => {
    setSort((prev) => (prev?.key === key && prev.dir === "asc" ? { key, dir: "desc" } : { key, dir: "asc" }));
  };

  if (rows.length === 0) return <>{empty ?? <EmptyState title="Nothing to show" />}</>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-border text-xs text-muted">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={
                    sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                  }
                  className={cn("px-4 py-2 font-medium", c.className)}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-fg"
                    >
                      {c.header}
                      {sort?.key === c.key &&
                        (sort.dir === "asc" ? (
                          <ArrowUpward fontSize="inherit" />
                        ) : (
                          <ArrowDownward fontSize="inherit" />
                        ))}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick && (() => onRowClick(row))}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-hover",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <nav aria-label="Table pages" className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted">
          <span>
            Page {current + 1} of {pageCount} ({sorted.length} rows)
          </span>
          <div className="flex gap-2">
            <Button size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              Previous
            </Button>
            <Button size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
              Next
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
