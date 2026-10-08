import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface OptionCardProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
}

// A radio input dressed as a card, so arrow keys and screen readers work natively.
export function OptionCard({ name, value, checked, onSelect, children }: OptionCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-1.5 rounded-lg border bg-panel p-4 transition-colors hover:bg-hover",
        "has-focus-visible:ring-2 has-focus-visible:ring-accent",
        checked ? "border-accent bg-accent/10" : "border-border",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
      {children}
    </label>
  );
}
