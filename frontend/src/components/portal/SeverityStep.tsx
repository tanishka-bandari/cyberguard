import { OptionCard } from "@/components/portal/OptionCard";
import { SEVERITY_OPTIONS } from "@/components/portal/reportOptions";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DEFAULT_RISK_SCORE, SEVERITY_LABEL, riskLevel } from "@/lib/domain/incident";
import type { Severity } from "@/types/domain";

interface SeverityStepProps {
  severity: Severity | null;
  riskScore: number;
  error?: string;
  onSeverity: (severity: Severity, riskScore: number) => void;
  onRiskScore: (riskScore: number) => void;
}

export function SeverityStep({ severity, riskScore, error, onSeverity, onRiskScore }: SeverityStepProps) {
  return (
    <div className="space-y-6">
      <fieldset aria-describedby={error ? "severity-error" : undefined}>
        <legend className="sr-only">Severity</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEVERITY_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              name="severity"
              value={option.value}
              checked={severity === option.value}
              onSelect={() => onSeverity(option.value, DEFAULT_RISK_SCORE[option.value])}
            >
              <span>
                <SeverityBadge severity={option.value} />
              </span>
              <span className="text-xs text-muted">{option.description}</span>
            </OptionCard>
          ))}
        </div>
        {error && (
          <p id="severity-error" role="alert" className="mt-3 text-sm font-medium text-critical-text">
            {error}
          </p>
        )}
      </fieldset>

      {severity && (
        <div className="max-w-md space-y-2">
          <label htmlFor="risk-score" className="block text-sm font-medium">
            Risk score: {riskScore} out of 100 ({SEVERITY_LABEL[riskLevel(riskScore)].toLowerCase()})
          </label>
          <input
            id="risk-score"
            type="range"
            min={0}
            max={100}
            value={riskScore}
            onChange={(event) => onRiskScore(Number(event.target.value))}
            aria-describedby="risk-hint"
            className="w-full accent-accent"
          />
          <RiskMeter value={riskScore} />
          <p id="risk-hint" className="text-xs text-muted">
            Pre-filled from the severity you chose. Move the slider if it does not fit.
          </p>
        </div>
      )}
    </div>
  );
}
