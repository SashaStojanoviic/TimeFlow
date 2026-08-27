import type { Assignment, TimeEntry, TimeEntryStatus, WeekSummary } from "./api/types";
import { isoWeek, weekStartOf } from "./date";

const ORDER: TimeEntryStatus[] = ["rejected", "draft", "submitted", "approved"];

/** Sammanvägd status: den "lägsta" statusen i gruppen styr. */
function combineStatus(statuses: TimeEntryStatus[]): TimeEntryStatus {
  for (const s of ORDER) if (statuses.includes(s)) return s;
  return "draft";
}

/** Grupperar tidposter till veckorapporter per konsult och uppdrag. */
export function buildWeekSummaries(
  entries: TimeEntry[],
  assignments: Assignment[],
): WeekSummary[] {
  const map = new Map<string, WeekSummary & { statuses: TimeEntryStatus[] }>();

  for (const e of entries) {
    const weekStart = weekStartOf(e.workDate);
    const key = `${e.consultantId}|${e.assignmentId}|${weekStart}`;
    const assignment = assignments.find((a) => a.id === e.assignmentId);
    const existing = map.get(key);
    if (existing) {
      existing.totalHours += e.hoursWorked;
      existing.breakMinutes += e.breakMinutes;
      existing.entryIds.push(e.id);
      existing.statuses.push(e.status);
      if (e.updatedAt > existing.lastActivity) existing.lastActivity = e.updatedAt;
    } else {
      map.set(key, {
        key,
        consultantId: e.consultantId,
        assignmentId: e.assignmentId,
        clientId: assignment?.clientId ?? "",
        weekStart,
        period: isoWeek(weekStart),
        totalHours: e.hoursWorked,
        breakMinutes: e.breakMinutes,
        entryIds: [e.id],
        statuses: [e.status],
        status: e.status,
        lastActivity: e.updatedAt,
      });
    }
  }

  return [...map.values()]
    .map(({ statuses, ...rest }) => ({
      ...rest,
      totalHours: Number(rest.totalHours.toFixed(2)),
      status: combineStatus(statuses),
    }))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}
