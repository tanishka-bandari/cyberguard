import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "accent" | "info" | "critical" | "high" | "medium" | "low";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-hover text-muted border-border",
  accent: "bg-accent/15 text-accent-text border-accent/40",
  info: "bg-info/15 text-info-text border-info/40",
  critical: "bg-critical/15 text-critical-text border-critical/40",
  high: "bg-high/15 text-high-text border-high/40",
  medium: "bg-medium/20 text-medium-text border-medium/50",
  low: "bg-low/15 text-low-text border-low/40",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
