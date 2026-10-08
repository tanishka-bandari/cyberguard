"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Close from "@mui/icons-material/Close";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

// Built on the native <dialog>: showModal() gives focus trapping, Escape to close
// and an inert background without extra code.
export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border border-border bg-panel p-0 text-fg backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-md text-lg text-muted hover:bg-hover hover:text-fg"
        >
          <Close fontSize="inherit" />
        </button>
      </div>
      <div className="p-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>}
    </dialog>
  );
}
