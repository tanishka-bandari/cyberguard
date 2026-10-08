import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ title = "Could not load this data", error, onRetry }: ErrorStateProps) {
  const detail = error instanceof Error ? error.message : undefined;
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <span className="text-3xl text-critical-text">
        <ErrorOutlined fontSize="inherit" />
      </span>
      <p className="font-medium">{title}</p>
      {detail && <p className="max-w-sm text-sm text-muted">{detail}</p>}
      {onRetry && (
        <Button size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
