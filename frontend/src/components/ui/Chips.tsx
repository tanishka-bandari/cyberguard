import { cn } from "@/lib/cn";

interface ChipsProps<T extends string> {
  label: string; // names the group for screen readers
  options: readonly { value: T; label: string }[];
  value: T | null; // null means "All"
  onChange: (value: T | null) => void;
  allLabel?: string;
}

// Single-select filter chips. Clicking the active chip clears it.
export function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
  allLabel = "All",
}: ChipsProps<T>) {
  const chip = (active: boolean) =>
    cn(
      "h-8 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors",
      active
        ? "border-accent bg-accent/15 text-accent-text"
        : "border-border bg-panel text-muted hover:bg-hover hover:text-fg",
    );
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      <button type="button" aria-pressed={value === null} className={chip(value === null)} onClick={() => onChange(null)}>
        {allLabel}
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={chip(value === o.value)}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
