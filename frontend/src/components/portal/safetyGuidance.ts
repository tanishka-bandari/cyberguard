import type { IncidentType } from "@/types/domain";

export const SAFETY_TIPS: Record<IncidentType, readonly string[]> = {
  PHISHING: [
    "Hover over a link to see the real address before you click it.",
    "A genuine company will not ask for your password by email.",
    "Report the message, then delete it. Do not forward it to colleagues.",
  ],
  MALWARE: [
    "If you think a device is infected, disconnect it from Wi-Fi and the network cable.",
    "Install software only from sources you trust, never from links in emails.",
    "Keep your system and antivirus up to date.",
  ],
  RANSOMWARE: [
    "Disconnect the device from the network straight away.",
    "Do not pay the ransom or contact the attackers.",
    "Leave the device as it is and wait for the security team's instructions.",
  ],
  DATA_BREACH: [
    "Write down what data was involved and who received it.",
    "Do not try to unsend messages or delete files yourself; they may be needed for the review.",
    "Change the passwords of any accounts that were affected.",
  ],
  UNAUTHORIZED_ACCESS: [
    "Change your password from a device you trust.",
    "Turn on two-factor authentication wherever it is offered.",
    "Check your account for sessions you do not recognise and sign them out.",
  ],
  DDOS: [
    "Note when the problem started and what stopped working.",
    "Avoid refreshing the page repeatedly, as it adds to the load.",
    "Check the official status page or channels for updates.",
  ],
  SOCIAL_ENGINEERING: [
    "Hang up and call back on a number you already trust.",
    "Urgency and secrecy are warning signs.",
    "It is fine to say no, even if the request claims to come from management.",
  ],
  OTHER: [
    "If something feels wrong, report it. A false alarm costs little.",
    "Write down what you saw while you still remember it clearly.",
    "Screenshots help the security team a lot.",
  ],
};
