"use client";

import { useState } from "react";
import Delete from "@mui/icons-material/Delete";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { Incident } from "@/types/domain";

interface DeleteIncidentProps {
  incident: Incident;
  busy: boolean;
  onConfirm: () => void;
}

export function DeleteIncident({ incident, busy, onConfirm }: DeleteIncidentProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Delete fontSize="inherit" />
        Delete
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this incident?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={onConfirm}>
              Delete incident
            </Button>
          </>
        }
      >
        <p className="text-sm">
          <strong>
            #{incident.id} {incident.title}
          </strong>{" "}
          will be removed together with its notes, evidence files and audit trail. This cannot be undone.
        </p>
      </Dialog>
    </>
  );
}
