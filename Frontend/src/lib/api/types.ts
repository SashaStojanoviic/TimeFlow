export type UserRole = "consultant" | "admin";

export type TimeEntryStatus = "draft" | "submitted" | "approved" | "rejected";

export type AssignmentStatus = "planned" | "active" | "completed" | "cancelled";

/** public.users */
export interface AppUser {
  /** uuid, samma id som auth.users */
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** public.clients */
export interface Client {
  id: string;
  name: string;
  orgNumber: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** public.assignments */
export interface Assignment {
  id: string;
  clientId: string;
  consultantId: string;
  name: string;
  description: string | null;
  /** numeric(10,2) */
  hourlyRate: number | null;
  startDate: string | null;
  endDate: string | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

/** public.time_entries */
export interface TimeEntry {
  id: string;
  consultantId: string;
  assignmentId: string;
  /** date, yyyy-MM-dd */
  workDate: string;
  /** time, HH:mm — valfri */
  startTime: string | null;
  endTime: string | null;
  /** numeric(5,2), 0–24 */
  hoursWorked: number;
  /** 0–1440 */
  breakMinutes: number;
  comment: string | null;
  status: TimeEntryStatus;
  createdAt: string;
  updatedAt: string;
}

/** Payload för POST /api/time-entries */
export interface CreateTimeEntryInput {
  consultantId: string;
  assignmentId: string;
  workDate: string;
  startTime?: string | null;
  endTime?: string | null;
  hoursWorked: number;
  breakMinutes: number;
  comment?: string | null;
}

/** Payload för PUT /api/time-entries/{id} */
export type UpdateTimeEntryInput = Partial<Omit<CreateTimeEntryInput, "consultantId">>;

/** Härledd sammanställning (beräknas i frontend, ingen egen tabell). */
export interface WeekSummary {
  key: string;
  consultantId: string;
  assignmentId: string;
  clientId: string;
  weekStart: string;
  /** ISO-veckoetikett, t.ex. 2026-V32 */
  period: string;
  totalHours: number;
  breakMinutes: number;
  entryIds: string[];
  /** Sammanvägd status för veckan */
  status: TimeEntryStatus;
  lastActivity: string;
}

export const STATUS_LABELS: Record<TimeEntryStatus, string> = {
  draft: "Utkast",
  submitted: "Väntar på attest",
  approved: "Attesterad",
  rejected: "Avvisad",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  planned: "Planerat",
  active: "Aktivt",
  completed: "Avslutat",
  cancelled: "Avbrutet",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  consultant: "Konsult",
  admin: "Konsultchef",
};
