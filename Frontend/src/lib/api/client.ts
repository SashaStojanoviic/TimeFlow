import {
  assignments as assignmentSeed,
  clients as clientSeed,
  timeEntries as entrySeed,
  users as userSeed,
} from "./mock-data";
import type {
  Assignment,
  AppUser,
  Client,
  CreateTimeEntryInput,
  TimeEntry,
  TimeEntryStatus,
  UpdateTimeEntryInput,
} from "./types";

export const API_BASE_URL = "http://localhost:5104";

/** Sätt till false när .NET-API:t är igång för att köra riktiga anrop. */
export const USE_MOCK = false;

export const endpoints = {
  users: "/api/users",
  me: "/api/users/me",
  clients: "/api/clients",
  assignments: "/api/assignments",
  timeEntries: "/api/time-entries",
} as const;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} misslyckades (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Demodatabas i minnet (används endast när USE_MOCK är true)          */
/* ------------------------------------------------------------------ */

const db = {
  users: [...userSeed],
  clients: [...clientSeed],
  assignments: [...assignmentSeed],
  entries: [...entrySeed],
};

const latency = () => new Promise((r) => setTimeout(r, 120));

async function mock<T>(resolve: () => T): Promise<T> {
  await latency();
  return resolve();
}

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `44444444-4444-4444-8444-${String(Date.now()).slice(-12)}`;
}

function query(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][],
  ).toString();
  return q ? `?${q}` : "";
}

/* ------------------------------------------------------------------ */

export const api = {
  getUsers: (): Promise<AppUser[]> =>
    USE_MOCK ? mock(() => [...db.users]) : http(endpoints.users),

  getClients: (): Promise<Client[]> =>
    USE_MOCK ? mock(() => [...db.clients]) : http(endpoints.clients),

  getAssignments: (consultantId?: string): Promise<Assignment[]> =>
    USE_MOCK
      ? mock(() =>
          db.assignments.filter((a) => !consultantId || a.consultantId === consultantId),
        )
      : http(`${endpoints.assignments}${query({ consultantId })}`),

  getTimeEntries: (params?: {
    consultantId?: string;
    from?: string;
    to?: string;
  }): Promise<TimeEntry[]> =>
    USE_MOCK
      ? mock(() =>
          db.entries.filter(
            (e) =>
              (!params?.consultantId || e.consultantId === params.consultantId) &&
              (!params?.from || e.workDate >= params.from) &&
              (!params?.to || e.workDate <= params.to),
          ),
        )
      : http(`${endpoints.timeEntries}${query(params ?? {})}`),

  createTimeEntry: (input: CreateTimeEntryInput): Promise<TimeEntry> =>
    USE_MOCK
      ? mock(() => {
          const now = new Date().toISOString();
          const created: TimeEntry = {
            id: uuid(),
            startTime: null,
            endTime: null,
            comment: null,
            ...input,
            status: "draft",
            createdAt: now,
            updatedAt: now,
          };
          db.entries = [...db.entries, created];
          return created;
        })
      : http(endpoints.timeEntries, { method: "POST", body: JSON.stringify(input) }),

  updateTimeEntry: (id: string, input: UpdateTimeEntryInput): Promise<TimeEntry> =>
    USE_MOCK
      ? mock(() => {
          db.entries = db.entries.map((e) =>
            e.id === id ? { ...e, ...input, updatedAt: new Date().toISOString() } : e,
          );
          return db.entries.find((e) => e.id === id) as TimeEntry;
        })
      : http(`${endpoints.timeEntries}/${id}`, { method: "PUT", body: JSON.stringify(input) }),

  setTimeEntryStatus: (id: string, status: TimeEntryStatus): Promise<TimeEntry> =>
    USE_MOCK
      ? mock(() => {
          db.entries = db.entries.map((e) =>
            e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e,
          );
          return db.entries.find((e) => e.id === id) as TimeEntry;
        })
      : http(`${endpoints.timeEntries}/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }),

  deleteTimeEntry: (id: string): Promise<{ id: string }> =>
    USE_MOCK
      ? mock(() => {
          db.entries = db.entries.filter((e) => e.id !== id);
          return { id };
        })
      : http(`${endpoints.timeEntries}/${id}`, { method: "DELETE" }).then(() => ({ id })),
};

/* ------------------------------------------------------------------ */
/* Visma-kompatibel CSV (semikolon, svenskt decimalkomma)              */
/* ------------------------------------------------------------------ */

export interface VismaRow {
  consultantId: string;
  assignmentId: string;
  period: string;
  totalHours: number;
  status: TimeEntryStatus;
}

export function buildVismaCsv(
  rows: VismaRow[],
  users: AppUser[],
  clients: Client[],
  assignments: Assignment[],
): string {
  const header = [
    "Anstallningsnummer",
    "Namn",
    "Kund",
    "Uppdrag",
    "Period",
    "Loneart",
    "Antal",
    "Status",
  ].join(";");

  const lines = rows.map((r) => {
    const user = users.find((u) => u.id === r.consultantId);
    const assignment = assignments.find((a) => a.id === r.assignmentId);
    const client = clients.find((c) => c.id === assignment?.clientId);
    return [
      r.consultantId,
      user?.fullName ?? "",
      client?.name ?? "",
      assignment?.name ?? "",
      r.period,
      "1001",
      r.totalHours.toFixed(2).replace(".", ","),
      r.status,
    ].join(";");
  });

  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
