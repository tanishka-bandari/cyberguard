import { OptionCard } from "@/components/portal/OptionCard";
import { TYPE_DESCRIPTION } from "@/components/portal/reportOptions";
import { TypeIcon } from "@/components/portal/TypeIcon";
import { INCIDENT_TYPES, TYPE_LABEL } from "@/lib/domain/incident";
import type { IncidentType } from "@/types/domain";

interface TypeStepProps {
  value: IncidentType | null;
  error?: string;
  onChange: (type: IncidentType) => void;
}

export function TypeStep({ value, error, onChange }: TypeStepProps) {
  return (
    <fieldset aria-describedby={error ? "type-error" : undefined}>
      <legend className="sr-only">Type of incident</legend>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {INCIDENT_TYPES.map((type) => (
          <OptionCard key={type} name="type" value={type} checked={value === type} onSelect={() => onChange(type)}>
            <span className="text-2xl text-accent-text">
              <TypeIcon type={type} />
            </span>
            <span className="font-medium">{TYPE_LABEL[type]}</span>
            <span className="text-xs text-muted">{TYPE_DESCRIPTION[type]}</span>
          </OptionCard>
        ))}
      </div>
      {error && (
        <p id="type-error" role="alert" className="mt-3 text-sm font-medium text-critical-text">
          {error}
        </p>
      )}
    </fieldset>
  );
}
