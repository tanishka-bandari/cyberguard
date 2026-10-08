export interface LegendItem {
  label: string;
  color: string;
}

// Swatch plus text in the normal ink colour, so identity never relies on colour alone.
export function ChartLegend({ items }: { items: readonly LegendItem[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
