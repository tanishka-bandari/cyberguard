import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { STATUSES, STATUS_LABEL, canMoveTo, isAssignable } from "@/lib/domain/incident";
import type { Incident, IncidentStatus, User } from "@/types/domain";

interface TriageActionsDialogProps {
  incident: Incident | null;
  staff: readonly User[];
  canMove: boolean;
  canAssign: boolean;
  onClose: () => void;
  onMove: (incident: Incident, status: IncidentStatus) => void;
  onAssign: (incident: Incident, person: User) => void;
  onUnassign: (incident: Incident) => void;
}

// Keyboard and touch path for everything drag and drop does on the board.
export function TriageActionsDialog({ incident, onClose, ...rest }: TriageActionsDialogProps) {
  return (
    <Dialog open={!!incident} onClose={onClose} title={incident ? `Incident #${incident.id}` : "Incident"}>
      {incident && <ActionsForm key={incident.id} incident={incident} onClose={onClose} {...rest} />}
    </Dialog>
  );
}

type FormProps = Omit<TriageActionsDialogProps, "incident"> & { incident: Incident };

function ActionsForm({ incident, staff, canMove, canAssign, onClose, onMove, onAssign, onUnassign }: FormProps) {
  const [status, setStatus] = useState(incident.status);
  const [assigneeId, setAssigneeId] = useState("");
  const person = staff.find((s) => String(s.id) === assigneeId);

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium">{incident.title}</p>

      {canMove && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Move to"
              value={status}
              hint={incident.assignee ? undefined : "Assign someone first to use Assigned, Under investigation or Contained."}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} disabled={!canMoveTo(incident, s)}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="primary"
            disabled={status === incident.status}
            onClick={() => {
              onMove(incident, status);
              onClose();
            }}
          >
            Move
          </Button>
        </div>
      )}

      {canAssign && !isAssignable(incident) && (
        <p className="text-sm text-muted">Reopen this incident first to change the assignee.</p>
      )}

      {canAssign && isAssignable(incident) && (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Assign to"
                hint={incident.assignee ? `Currently ${incident.assignee.name}` : "Currently unassigned"}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Choose a person</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.id === incident.assignee?.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="primary"
              disabled={!person}
              onClick={() => {
                if (person) onAssign(incident, person);
                onClose();
              }}
            >
              Assign
            </Button>
          </div>
          {incident.assignee && (
            <Button
              size="sm"
              onClick={() => {
                onUnassign(incident);
                onClose();
              }}
            >
              Unassign
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
