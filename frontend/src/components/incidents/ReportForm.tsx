"use client";

import { useId, useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { TypeSelect } from "@/components/incidents/TypeSelect";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { INCIDENTS_KEY } from "@/hooks/useIncidents";
import { errorMessage } from "@/lib/api/client";
import { createIncident } from "@/lib/api/incidents";
import { DEFAULT_RISK_SCORE, DESCRIPTION_MAX, SEVERITY_OPTIONS, TITLE_MAX } from "@/lib/domain/incident";
import { toast } from "@/lib/toast";
import type { Incident, IncidentType, Severity } from "@/types/domain";

interface ReportFormProps {
  onCreated: (incident: Incident) => void;
  onCancel?: () => void;
}

export function ReportForm({ onCreated, onCancel }: ReportFormProps) {
  const { mutate } = useSWRConfig();
  const riskId = useId();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<IncidentType>("OTHER");
  const [severity, setSeverity] = useState<Severity>("MEDIUM");
  const [risk, setRisk] = useState<number | null>(null); // null until the user moves the slider
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const riskScore = risk ?? DEFAULT_RISK_SCORE[severity];
  const titleError = !title.trim() ? "Enter a title" : undefined;
  const descriptionError = !description.trim() ? "Describe what happened" : undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (titleError || descriptionError) return;
    setSaving(true);
    try {
      const incident = await createIncident({
        title: title.trim(),
        description: description.trim(),
        type,
        severity,
        riskScore,
      });
      await mutate(INCIDENTS_KEY);
      toast.success(`Incident #${incident.id} reported`);
      onCreated(incident);
    } catch (error) {
      toast.error(errorMessage(error, "Could not report the incident"));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Title"
        value={title}
        maxLength={TITLE_MAX}
        onChange={(e) => setTitle(e.target.value)}
        error={submitted ? titleError : undefined}
        autoFocus
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TypeSelect value={type} onChange={(t) => t && setType(t)} />
        <Select label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <Field id={riskId} label={`Risk score: ${riskScore}`} hint="Starts from the severity; adjust if you know better.">
        <input
          id={riskId}
          type="range"
          min={0}
          max={100}
          value={riskScore}
          onChange={(e) => setRisk(Number(e.target.value))}
          aria-describedby={`${riskId}-hint`}
          className="w-full accent-accent"
        />
      </Field>
      <Textarea
        label="Description"
        value={description}
        maxLength={DESCRIPTION_MAX}
        onChange={(e) => setDescription(e.target.value)}
        error={submitted ? descriptionError : undefined}
        hint={`${description.length} / ${DESCRIPTION_MAX}`}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={saving}>
          Report incident
        </Button>
      </div>
    </form>
  );
}
