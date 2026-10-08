import Link from "next/link";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ReportSuccessProps {
  incidentId: number;
  failedFiles: string[];
  onReportAnother: () => void;
}

export function ReportSuccess({ incidentId, failedFiles, onReportAnother }: ReportSuccessProps) {
  return (
    <Card className="mx-auto max-w-xl">
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="text-5xl text-accent-text">
          <CheckCircle fontSize="inherit" />
        </span>
        <h2 className="text-xl font-semibold">Case #{incidentId} is open</h2>
        <p className="max-w-sm text-sm text-muted">
          The security team has your report. You can follow every step on the case page.
        </p>
        {failedFiles.length > 0 && (
          <p role="alert" className="max-w-sm text-sm text-critical-text">
            The report was saved, but these files could not be uploaded: {failedFiles.join(", ")}. You can add them
            again from the case page.
          </p>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link href={`/portal/cases/${incidentId}`} className={buttonClass("primary")}>
            Track this case
          </Link>
          <Button onClick={onReportAnother}>Report another</Button>
        </div>
      </div>
    </Card>
  );
}
