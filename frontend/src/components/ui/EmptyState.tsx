import type { ReactNode } from "react";
import Inbox from "@mui/icons-material/Inbox";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <span className="text-3xl text-muted">
        <Inbox fontSize="inherit" />
      </span>
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
