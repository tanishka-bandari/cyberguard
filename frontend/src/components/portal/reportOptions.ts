import type { IncidentType, Severity } from "@/types/domain";

export const TYPE_DESCRIPTION: Record<IncidentType, string> = {
  PHISHING: "Suspicious email, message or fake login page",
  MALWARE: "Strange pop-ups, a slow computer or unknown programs",
  RANSOMWARE: "Files locked or renamed, or a ransom note on screen",
  DATA_BREACH: "Data leaked, sent to the wrong place or left exposed",
  UNAUTHORIZED_ACCESS: "Someone signed in who should not have",
  DDOS: "A website or service flooded and unreachable",
  SOCIAL_ENGINEERING: "Someone tricked or pressured you into sharing information",
  OTHER: "Anything else that feels wrong",
};

// Shown low to critical. The risk score is pre-filled from the severity and can be adjusted.
export const SEVERITY_OPTIONS: readonly { value: Severity; description: string }[] = [
  { value: "LOW", description: "Minor, and nothing seems damaged" },
  { value: "MEDIUM", description: "Something is wrong, but it looks contained" },
  { value: "HIGH", description: "Accounts, data or systems are at risk" },
  { value: "CRITICAL", description: "An active attack, spreading or data being taken" },
];

export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
