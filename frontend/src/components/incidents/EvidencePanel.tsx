"use client";

import { useRef, useState, type DragEvent } from "react";
import { useSWRConfig } from "swr";
import Download from "@mui/icons-material/Download";
import UploadFile from "@mui/icons-material/UploadFile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { auditKey } from "@/hooks/useAuditLog";
import { useEvidence } from "@/hooks/useEvidence";
import { useSession } from "@/hooks/useSession";
import { errorMessage } from "@/lib/api/client";
import { downloadEvidence, uploadEvidence } from "@/lib/api/evidence";
import { can } from "@/lib/auth/permissions";
import { cn } from "@/lib/cn";
import { formatDateTime, formatFileSize } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { Evidence, Incident } from "@/types/domain";

const MAX_BYTES = 10 * 1024 * 1024;
const HASH_PREVIEW = 12;

export function EvidencePanel({ incident }: { incident: Incident }) {
  const { user } = useSession();
  const { mutate: refreshAudit } = useSWRConfig();
  const { data: items, error, isLoading, mutate } = useEvidence(incident.id);
  const picker = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  async function uploadFiles(files: File[]) {
    const accepted = files.filter((file) => {
      if (file.size <= MAX_BYTES) return true;
      toast.error(`${file.name} is larger than ${formatFileSize(MAX_BYTES)} and was skipped`);
      return false;
    });
    if (accepted.length === 0) return;

    for (const [index, file] of accepted.entries()) {
      setUpload({ done: index, total: accepted.length });
      try {
        await uploadEvidence(incident.id, file);
      } catch (e) {
        toast.error(`${file.name}: ${errorMessage(e, "upload failed")}`);
      }
    }
    setUpload(null);
    await mutate();
    void refreshAudit(auditKey(incident.id));
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!upload) void uploadFiles([...event.dataTransfer.files]);
  }

  async function handleDownload(item: Evidence) {
    setDownloading(item.id);
    try {
      await downloadEvidence(item);
    } catch (e) {
      toast.error(errorMessage(e, "The file could not be downloaded"));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <Card title={`Evidence${items ? ` (${items.length})` : ""}`}>
      {can(user, "evidence:upload", incident) && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "mb-4 flex flex-col items-center gap-2 rounded-md border border-dashed px-4 py-6 text-center",
            dragging ? "border-accent bg-accent/10" : "border-border",
          )}
        >
          <p className="text-sm text-muted">Drop files here, up to {formatFileSize(MAX_BYTES)} each</p>
          <input
            ref={picker}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              void uploadFiles([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <Button size="sm" loading={!!upload} onClick={() => picker.current?.click()}>
            <UploadFile fontSize="inherit" />
            {upload ? `Uploading ${upload.done + 1} of ${upload.total}` : "Choose files"}
          </Button>
          {upload && (
            <Progress value={(upload.done / upload.total) * 100} label="Upload progress" className="max-w-xs" />
          )}
        </div>
      )}
      {isLoading ? (
        <Skeleton className="h-16" />
      ) : error ? (
        <ErrorState title="Could not load evidence" error={error} onRetry={() => mutate()} />
      ) : items && items.length > 0 ? (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="break-all text-sm font-medium">{item.fileName}</p>
                <p className="text-xs text-muted">
                  {formatFileSize(item.fileSize)} - {item.uploadedBy.name} - {formatDateTime(item.uploadedAt)}
                </p>
                <p className="font-mono text-xs text-muted" title={item.sha256}>
                  SHA-256 {item.sha256.slice(0, HASH_PREVIEW)}...
                </p>
              </div>
              <Button
                size="sm"
                loading={downloading === item.id}
                aria-label={`Download ${item.fileName}`}
                onClick={() => handleDownload(item)}
              >
                <Download fontSize="inherit" />
                Download
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No evidence attached" />
      )}
    </Card>
  );
}
