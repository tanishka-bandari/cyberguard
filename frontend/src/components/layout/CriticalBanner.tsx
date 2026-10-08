import Link from "next/link";
import Close from "@mui/icons-material/Close";
import Report from "@mui/icons-material/Report";
import type { Incident } from "@/types/domain";

interface CriticalBannerProps {
  incident: Incident | null;
  onDismiss: () => void;
}

export function CriticalBanner({ incident, onDismiss }: CriticalBannerProps) {
  if (!incident) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-3 border-b border-critical/50 bg-critical/15 px-4 py-2 text-sm text-critical-text"
    >
      <span className="text-lg">
        <Report fontSize="inherit" />
      </span>
      <p className="flex-1">
        New critical incident: <span className="font-semibold">{incident.title}</span>
      </p>
      <Link href={`/incidents/${incident.id}`} className="font-semibold underline">
        Open
      </Link>
      <button
        type="button"
        aria-label="Dismiss alert"
        onClick={onDismiss}
        className="grid size-7 place-items-center rounded hover:bg-critical/20"
      >
        <Close fontSize="inherit" />
      </button>
    </div>
  );
}
