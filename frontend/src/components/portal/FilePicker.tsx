"use client";

import { useRef } from "react";
import Close from "@mui/icons-material/Close";
import Upload from "@mui/icons-material/Upload";
import { MAX_FILES, MAX_FILE_BYTES } from "@/components/portal/reportOptions";
import { Button } from "@/components/ui/Button";
import { formatFileSize } from "@/lib/format";

interface FilePickerProps {
  files: File[];
  error: string;
  onPick: (picked: File[]) => void;
  onRemove: (index: number) => void;
}

export function FilePicker({ files, error, onPick, onRemove }: FilePickerProps) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Evidence (optional)</p>
      <p className="text-xs text-muted">
        Screenshots or documents, up to {MAX_FILES} files of {formatFileSize(MAX_FILE_BYTES)} each.
      </p>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        aria-label="Evidence files"
        onChange={(event) => {
          onPick(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <Button size="sm" disabled={files.length >= MAX_FILES} onClick={() => input.current?.click()}>
        <Upload fontSize="inherit" />
        Choose files
      </Button>
      {error && (
        <p role="alert" className="text-xs font-medium text-critical-text">
          {error}
        </p>
      )}
      {files.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                {file.name} <span className="text-muted">({formatFileSize(file.size)})</span>
              </span>
              <Button size="sm" variant="ghost" aria-label={`Remove ${file.name}`} onClick={() => onRemove(index)}>
                <Close fontSize="inherit" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
