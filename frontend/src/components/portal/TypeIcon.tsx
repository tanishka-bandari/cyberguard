import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import BugReport from "@mui/icons-material/BugReport";
import Groups from "@mui/icons-material/Groups";
import Help from "@mui/icons-material/Help";
import Lock from "@mui/icons-material/Lock";
import Phishing from "@mui/icons-material/Phishing";
import Storage from "@mui/icons-material/Storage";
import VpnKey from "@mui/icons-material/VpnKey";
import Waves from "@mui/icons-material/Waves";
import type { IncidentType } from "@/types/domain";

const ICONS: Record<IncidentType, ComponentType<SvgIconProps>> = {
  PHISHING: Phishing,
  MALWARE: BugReport,
  RANSOMWARE: Lock,
  DATA_BREACH: Storage,
  UNAUTHORIZED_ACCESS: VpnKey,
  DDOS: Waves,
  SOCIAL_ENGINEERING: Groups,
  OTHER: Help,
};

export function TypeIcon({ type }: { type: IncidentType }) {
  const Icon = ICONS[type];
  return <Icon fontSize="inherit" aria-hidden="true" />;
}
