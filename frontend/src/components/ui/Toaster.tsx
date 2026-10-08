"use client";

import { useSyncExternalStore } from "react";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import Close from "@mui/icons-material/Close";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { cn } from "@/lib/cn";
import { dismissToast, getToasts, subscribeToasts, type ToastKind } from "@/lib/toast";

const ICON: Record<ToastKind, typeof InfoOutlined> = {
  success: CheckCircleOutlined,
  error: ErrorOutlined,
  info: InfoOutlined,
};

const ACCENT: Record<ToastKind, string> = {
  success: "text-accent-text",
  error: "text-critical-text",
  info: "text-info-text",
};

const NONE: never[] = [];

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, () => NONE);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4"
    >
      {toasts.map((t) => {
        const Icon = ICON[t.kind];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border border-border bg-panel p-3 text-sm shadow-lg"
          >
            <span className={cn("mt-0.5 text-lg", ACCENT[t.kind])}>
              <Icon fontSize="inherit" />
            </span>
            <p className="flex-1 break-words">{t.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(t.id)}
              className="grid size-6 place-items-center rounded text-muted hover:bg-hover hover:text-fg"
            >
              <Close fontSize="inherit" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
