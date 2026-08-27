import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "./api/client";
import { CURRENT_ADMIN_ID, CURRENT_CONSULTANT_ID } from "./api/mock-data";
import type {
  AppUser,
  Assignment,
  Client,
  CreateTimeEntryInput,
  TimeEntry,
  TimeEntryStatus,
  UpdateTimeEntryInput,
  UserRole,
} from "./api/types";

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AppUser | undefined;
  currentConsultantId: string;
  users: AppUser[];
  consultants: AppUser[];
  clients: Client[];
  assignments: Assignment[];
  entries: TimeEntry[];
  loading: boolean;
  addEntry: (input: CreateTimeEntryInput) => Promise<void>;
  updateEntry: (id: string, input: UpdateTimeEntryInput) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  setEntryStatus: (id: string, status: TimeEntryStatus) => Promise<void>;
  setEntriesStatus: (ids: string[], status: TimeEntryStatus) => Promise<void>;
  userName: (id: string) => string;
  clientName: (id: string | null | undefined) => string;
  assignmentName: (id: string | null | undefined) => string;
  assignmentById: (id: string | null | undefined) => Assignment | undefined;
  clientOfAssignment: (id: string | null | undefined) => Client | undefined;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("consultant");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.getUsers(),
      api.getClients(),
      api.getAssignments(),
      api.getTimeEntries(),
    ])
      .then(([u, c, a, e]) => {
        if (!alive) return;
        setUsers(u);
        setClients(c);
        setAssignments(a);
        setEntries(e);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const addEntry = useCallback(async (input: CreateTimeEntryInput) => {
    const created = await api.createTimeEntry(input);
    setEntries((prev) => [...prev, created]);
  }, []);

  const updateEntry = useCallback(async (id: string, input: UpdateTimeEntryInput) => {
    const updated = await api.updateTimeEntry(id, input);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    await api.deleteTimeEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setEntryStatus = useCallback(async (id: string, status: TimeEntryStatus) => {
    const updated = await api.setTimeEntryStatus(id, status);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);

  const setEntriesStatus = useCallback(async (ids: string[], status: TimeEntryStatus) => {
    const updated = await Promise.all(ids.map((id) => api.setTimeEntryStatus(id, status)));
    setEntries((prev) => prev.map((e) => updated.find((u) => u.id === e.id) ?? e));
  }, []);

  const value = useMemo<AppState>(() => {
    const currentUserId = role === "admin" ? CURRENT_ADMIN_ID : CURRENT_CONSULTANT_ID;
    const assignmentById = (id: string | null | undefined) =>
      assignments.find((a) => a.id === id);
    return {
      role,
      setRole,
      currentUser: users.find((u) => u.id === currentUserId),
      currentConsultantId: CURRENT_CONSULTANT_ID,
      users,
      consultants: users.filter((u) => u.role === "consultant"),
      clients,
      assignments,
      entries,
      loading,
      addEntry,
      updateEntry,
      removeEntry,
      setEntryStatus,
      setEntriesStatus,
      userName: (id) => users.find((u) => u.id === id)?.fullName ?? "Okänd",
      clientName: (id) => clients.find((c) => c.id === id)?.name ?? "Ingen kund",
      assignmentName: (id) => assignmentById(id)?.name ?? "Inget uppdrag",
      assignmentById,
      clientOfAssignment: (id) => {
        const a = assignmentById(id);
        return clients.find((c) => c.id === a?.clientId);
      },
    };
  }, [
    role,
    users,
    clients,
    assignments,
    entries,
    loading,
    addEntry,
    updateEntry,
    removeEntry,
    setEntryStatus,
    setEntriesStatus,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
