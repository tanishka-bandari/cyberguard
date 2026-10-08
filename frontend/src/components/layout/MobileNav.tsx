"use client";

import { useEffect, useRef } from "react";
import Close from "@mui/icons-material/Close";
import { BrandMark } from "@/components/layout/BrandMark";
import { NavList } from "@/components/layout/NavList";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

// Slide-in drawer for screens below lg, built on a native modal <dialog>.
export function MobileNav({ open, onClose }: MobileNavProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Navigation menu"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r border-border bg-panel p-0 text-fg backdrop:bg-black/60 lg:hidden"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <BrandMark />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md text-lg text-muted hover:bg-hover hover:text-fg"
          >
            <Close fontSize="inherit" />
          </button>
        </div>
        <NavList onNavigate={onClose} />
      </div>
    </dialog>
  );
}
