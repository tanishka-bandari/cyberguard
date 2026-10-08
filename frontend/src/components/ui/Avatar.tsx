import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-accent/20 text-xs font-semibold text-accent-text",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
