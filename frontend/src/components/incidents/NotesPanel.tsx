"use client";

import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { auditKey } from "@/hooks/useAuditLog";
import { useNotes } from "@/hooks/useNotes";
import { useSession } from "@/hooks/useSession";
import { addNote } from "@/lib/api/notes";
import { can } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { Incident } from "@/types/domain";

const NOTE_MAX = 2000;

export function NotesPanel({ incident }: { incident: Incident }) {
  const { user } = useSession();
  const { mutate: refreshAudit } = useSWRConfig();
  const { data: notes, error, isLoading, mutate } = useNotes(incident.id);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await addNote(incident.id, text.trim());
      setText("");
      await mutate();
      void refreshAudit(auditKey(incident.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The note could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title={`Notes${notes ? ` (${notes.length})` : ""}`}>
      {isLoading ? (
        <Skeleton className="h-16" />
      ) : error ? (
        <ErrorState title="Could not load notes" error={error} onRetry={() => mutate()} />
      ) : notes && notes.length > 0 ? (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="flex gap-3">
              <Avatar name={note.author.name} />
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{note.author.name}</span>
                  <time dateTime={note.createdAt.toISOString()} className="ml-2 text-xs text-muted">
                    {formatDateTime(note.createdAt)}
                  </time>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">{note.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No notes yet" description={can(user, "note:add") ? "Record findings and decisions here." : undefined} />
      )}
      {can(user, "note:add") && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2 border-t border-border pt-4">
          <Textarea
            label="Add a note"
            rows={3}
            maxLength={NOTE_MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" loading={saving} disabled={!text.trim()}>
              Add note
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
