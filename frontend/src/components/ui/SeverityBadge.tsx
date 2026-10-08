import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Report from "@mui/icons-material/Report";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { SEVERITY_LABEL } from "@/lib/domain/incident";
import type { Severity } from "@/types/domain";

const ICONS: Record<Severity, ComponentType<SvgIconProps>> = {
  CRITICAL: Report,
  HIGH: WarningAmber,
  MEDIUM: InfoOutlined,
  LOW: KeyboardArrowDown,
};

// Severity is always label + icon, never colour alone.
export function SeverityBadge({ severity }: { severity: Severity }) {
  const Icon = ICONS[severity];
  const tone = severity.toLowerCase() as BadgeTone;
  return (
    <Badge tone={tone} icon={<Icon fontSize="inherit" />}>
      {SEVERITY_LABEL[severity]}
    </Badge>
  );
}
