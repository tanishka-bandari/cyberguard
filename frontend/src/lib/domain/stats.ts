import {
  STATUSES,
  STATUS_GROUP,
  isOpen,
  isSlaBreached,
  slaDeadline,
} from "@/lib/domain/incident";
import type { Incident, IncidentStatus, IncidentType, Severity, User } from "@/types/domain";

// Policy: a staff member with this many open incidents counts as overloaded.
export const OVERLOADED_OPEN = 4;

export function countBy<T, K extends string>(items: readonly T[], key: (item: T) => K) {
  const counts: Partial<Record<K, number>> = {};
  for (const item of items) counts[key(item)] = (counts[key(item)] ?? 0) + 1;
  return counts;
}

export const openIncidents = (incidents: readonly Incident[]) => incidents.filter(isOpen);

export const unassignedOpen = (incidents: readonly Incident[]) =>
  incidents.filter((i) => isOpen(i) && !i.assignee);

export const slaBreaches = (incidents: readonly Incident[], now: Date) =>
  incidents.filter((i) => isSlaBreached(i, now));

// Positive while time remains, negative once the deadline has passed.
export const msUntilBreach = (incident: Incident, now: Date) =>
  slaDeadline(incident).getTime() - now.getTime();

// The last `days` local calendar days including today, i.e. exactly the days bucketByDay shows,
// so chart totals match the counts. days === null means no limit.
export function reportedWithin(incidents: readonly Incident[], days: number | null, now: Date) {
  if (days === null) return [...incidents];
  const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)).getTime();
  return incidents.filter((i) => i.reportedAt.getTime() >= since);
}

export interface DayBucket {
  day: Date; // local midnight
  total: number;
  bySeverity: Record<Severity, number>;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// One bucket per local calendar day, oldest first, ending today. Empty days are kept.
export function bucketByDay(incidents: readonly Incident[], days: number, now: Date): DayBucket[] {
  const buckets: DayBucket[] = [];
  for (let k = days - 1; k >= 0; k--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k);
    buckets.push({ day, total: 0, bySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 } });
  }
  const byKey = new Map(buckets.map((b) => [dayKey(b.day), b]));
  for (const incident of incidents) {
    const bucket = byKey.get(dayKey(incident.reportedAt));
    if (!bucket) continue;
    bucket.total += 1;
    bucket.bySeverity[incident.severity] += 1;
  }
  return buckets;
}

// Open workflow stages only, in workflow order, zeros included.
export function openByStatus(incidents: readonly Incident[]): { status: IncidentStatus; count: number }[] {
  const counts = countBy(incidents, (i) => i.status);
  return STATUSES.filter((s) => STATUS_GROUP[s] !== "solved").map((status) => ({
    status,
    count: counts[status] ?? 0,
  }));
}

// Types that occur at least once, most frequent first.
export function byType(incidents: readonly Incident[]): { type: IncidentType; count: number }[] {
  const counts = countBy(incidents, (i) => i.type);
  return (Object.entries(counts) as [IncidentType, number][])
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export const resolutionRate = (resolved: number, assigned: number) =>
  assigned === 0 ? null : Math.round((resolved / assigned) * 100);

export interface StaffWorkload {
  person: User;
  assigned: number;
  open: number;
  resolved: number;
  rate: number | null; // percent, null when nothing was ever assigned
}

export function workloadByStaff(incidents: readonly Incident[], staff: readonly User[]): StaffWorkload[] {
  return staff.map((person) => {
    const mine = incidents.filter((i) => i.assignee?.id === person.id);
    const open = mine.filter(isOpen).length;
    return {
      person,
      assigned: mine.length,
      open,
      resolved: mine.length - open,
      rate: resolutionRate(mine.length - open, mine.length),
    };
  });
}
