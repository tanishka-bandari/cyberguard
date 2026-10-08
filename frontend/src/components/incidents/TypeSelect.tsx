import { Select } from "@/components/ui/Select";
import { TYPE_OPTIONS } from "@/lib/domain/incident";
import type { IncidentType } from "@/types/domain";

interface TypeSelectProps {
  value: IncidentType | null;
  onChange: (value: IncidentType | null) => void;
  // Adds an option that clears the choice, for filters. Forms leave it out.
  allLabel?: string;
}

export function TypeSelect({ value, onChange, allLabel }: TypeSelectProps) {
  return (
    <Select label="Type" value={value ?? ""} onChange={(e) => onChange((e.target.value || null) as IncidentType | null)}>
      {allLabel && <option value="">{allLabel}</option>}
      {TYPE_OPTIONS.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </Select>
  );
}
