"use client";

import { useEffect, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { DetailsStep } from "@/components/portal/DetailsStep";
import { ReportSuccess } from "@/components/portal/ReportSuccess";
import { ReviewStep } from "@/components/portal/ReviewStep";
import { SeverityStep } from "@/components/portal/SeverityStep";
import { StepIndicator } from "@/components/portal/StepIndicator";
import { TypeStep } from "@/components/portal/TypeStep";
import {
  EMPTY_DRAFT,
  STEP_TITLES,
  addFiles,
  validateStep,
  type DraftErrors,
  type ReportDraft,
} from "@/components/portal/reportDraft";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INCIDENTS_KEY } from "@/hooks/useIncidents";
import { createIncident } from "@/lib/api/incidents";
import { uploadEvidence } from "@/lib/api/evidence";

const LAST_STEP = STEP_TITLES.length - 1;

interface Created {
  id: number;
  failedFiles: string[];
}

export function ReportWizard() {
  const { mutate } = useSWRConfig();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the step heading so keyboard and screen reader users land on the new content.
  useEffect(() => {
    if (firstRender.current) firstRender.current = false;
    else heading.current?.focus();
  }, [step]);

  const change = (patch: Partial<ReportDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const next = () => {
    const found = validateStep(step, draft);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(step + 1);
  };

  const back = () => {
    setErrors({});
    setSubmitError("");
    setStep(step - 1);
  };

  const pickFiles = (picked: File[]) => {
    const result = addFiles(draft.files, picked);
    change({ files: result.files });
    setFileError(result.error);
  };

  const submit = async () => {
    if (!draft.type || !draft.severity) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const incident = await createIncident({
        title: draft.title.trim(),
        description: draft.description.trim(),
        type: draft.type,
        severity: draft.severity,
        riskScore: draft.riskScore,
      });
      const uploads = await Promise.allSettled(draft.files.map((file) => uploadEvidence(incident.id, file)));
      const failedFiles = draft.files
        .filter((_, index) => uploads[index].status === "rejected")
        .map((f) => f.name);
      void mutate(INCIDENTS_KEY);
      setCreated({ id: incident.id, failedFiles });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The report could not be sent.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setFileError("");
    setCreated(null);
    setStep(0);
  };

  if (created) {
    return (
      <ReportSuccess incidentId={created.id} failedFiles={created.failedFiles} onReportAnother={reset} />
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <StepIndicator current={step} />
        <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold outline-none">
          {STEP_TITLES[step]}
        </h2>

        {step === 0 && (
          <TypeStep value={draft.type} error={errors.type} onChange={(type) => change({ type })} />
        )}
        {step === 1 && (
          <SeverityStep
            severity={draft.severity}
            riskScore={draft.riskScore}
            error={errors.severity}
            onSeverity={(severity, riskScore) => change({ severity, riskScore })}
            onRiskScore={(riskScore) => change({ riskScore })}
          />
        )}
        {step === 2 && (
          <DetailsStep
            draft={draft}
            errors={errors}
            fileError={fileError}
            onChange={change}
            onPickFiles={pickFiles}
          />
        )}
        {step === 3 && <ReviewStep draft={draft} />}

        {submitError && (
          <p role="alert" className="text-sm font-medium text-critical-text">
            {submitError}
          </p>
        )}

        <div className="flex justify-between gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
            Back
          </Button>
          {step < LAST_STEP ? (
            <Button variant="primary" onClick={next}>
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={submit} loading={submitting}>
              Send report
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
