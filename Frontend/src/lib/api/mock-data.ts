/**
 * Demodata som speglar databasschemat. Används bara när appen körs utan
 * .NET-backend (se USE_MOCK i client.ts). Id:n är riktiga uuid:er eftersom
 * samtliga primärnycklar i schemat är uuid.
 */
import { addDays, currentWeekStart } from "../date";
import type { Assignment, AppUser, Client, TimeEntry } from "./types";

const NOW = "2026-08-01T08:00:00Z";

export const CURRENT_CONSULTANT_ID = "11111111-1111-4111-8111-000000000001";
export const CURRENT_ADMIN_ID = "11111111-1111-4111-8111-0000000000a1";

export const users: AppUser[] = [
  {
    id: CURRENT_ADMIN_ID,
    email: "karin.wallin@teampower.se",
    fullName: "Karin Wallin",
    role: "admin",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: CURRENT_CONSULTANT_ID,
    email: "sara.bergstrom@teampower.se",
    fullName: "Sara Bergström",
    role: "consultant",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "11111111-1111-4111-8111-000000000002",
    email: "ahmed.karim@teampower.se",
    fullName: "Ahmed Karim",
    role: "consultant",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "11111111-1111-4111-8111-000000000003",
    email: "linnea.sundqvist@teampower.se",
    fullName: "Linnea Sundqvist",
    role: "consultant",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "11111111-1111-4111-8111-000000000004",
    email: "marcus.oberg@teampower.se",
    fullName: "Marcus Öberg",
    role: "consultant",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "11111111-1111-4111-8111-000000000005",
    email: "fatima.hassan@teampower.se",
    fullName: "Fatima Hassan",
    role: "consultant",
    isActive: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const clients: Client[] = [
  {
    id: "22222222-2222-4222-8222-000000000001",
    name: "Volvo Group Trucks",
    orgNumber: "556012-5790",
    contactName: "Anna Lindqvist",
    contactEmail: "anna.lindqvist@volvo.se",
    contactPhone: "031-123 45 67",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "22222222-2222-4222-8222-000000000002",
    name: "Scandic Hotels AB",
    orgNumber: "556703-1702",
    contactName: "Johan Persson",
    contactEmail: "johan.persson@scandic.se",
    contactPhone: "08-517 350 00",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "22222222-2222-4222-8222-000000000003",
    name: "Region Skåne Vårdcentral",
    orgNumber: "232100-0255",
    contactName: "Maria Ek",
    contactEmail: "maria.ek@skane.se",
    contactPhone: "040-33 10 00",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "22222222-2222-4222-8222-000000000004",
    name: "Nordlog Logistik AB",
    orgNumber: "556889-4412",
    contactName: "Peter Sandström",
    contactEmail: "peter@nordlog.se",
    contactPhone: "0470-55 12 00",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "22222222-2222-4222-8222-000000000005",
    name: "Byggpartner Väst AB",
    orgNumber: "556421-9987",
    contactName: "Elin Hagberg",
    contactEmail: "elin@byggpartnervast.se",
    contactPhone: "031-778 90 10",
    isActive: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const assignments: Assignment[] = [
  {
    id: "33333333-3333-4333-8333-000000000001",
    clientId: clients[0].id,
    consultantId: CURRENT_CONSULTANT_ID,
    name: "Systemutveckling orderportal",
    description: "Vidareutveckling av kundens interna orderportal, .NET och React.",
    hourlyRate: 895,
    startDate: "2025-03-01",
    endDate: "2026-12-31",
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "33333333-3333-4333-8333-000000000002",
    clientId: clients[1].id,
    consultantId: CURRENT_CONSULTANT_ID,
    name: "Integrationsstöd bokningssystem",
    description: "Deltidsuppdrag med API-integrationer mot bokningsplattformen.",
    hourlyRate: 780,
    startDate: "2026-05-01",
    endDate: null,
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "33333333-3333-4333-8333-000000000003",
    clientId: clients[3].id,
    consultantId: "11111111-1111-4111-8111-000000000002",
    name: "Lager och terminal Växjö",
    description: null,
    hourlyRate: 575,
    startDate: "2025-01-15",
    endDate: "2026-08-31",
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "33333333-3333-4333-8333-000000000004",
    clientId: clients[2].id,
    consultantId: "11111111-1111-4111-8111-000000000003",
    name: "Undersköterska vårdcentral Malmö",
    description: null,
    hourlyRate: 1120,
    startDate: "2024-09-04",
    endDate: null,
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "33333333-3333-4333-8333-000000000005",
    clientId: clients[1].id,
    consultantId: "11111111-1111-4111-8111-000000000004",
    name: "Reception Scandic Göteborg",
    description: null,
    hourlyRate: 640,
    startDate: "2026-06-01",
    endDate: null,
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "33333333-3333-4333-8333-000000000006",
    clientId: clients[4].id,
    consultantId: "11111111-1111-4111-8111-000000000005",
    name: "Ekonomiassistent projektredovisning",
    description: null,
    hourlyRate: 690,
    startDate: "2026-09-01",
    endDate: null,
    status: "planned",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const thisWeek = currentWeekStart();
const lastWeek = addDays(thisWeek, -7);
const twoWeeksAgo = addDays(thisWeek, -14);

let seq = 0;
function entry(
  e: Omit<TimeEntry, "id" | "createdAt" | "updatedAt" | "startTime" | "endTime" | "comment"> &
    Partial<Pick<TimeEntry, "startTime" | "endTime" | "comment">>,
): TimeEntry {
  seq += 1;
  return {
    startTime: "08:00",
    endTime: "17:00",
    comment: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...e,
    id: `44444444-4444-4444-8444-${String(seq).padStart(12, "0")}`,
  };
}

export const timeEntries: TimeEntry[] = [
  entry({
    consultantId: CURRENT_CONSULTANT_ID,
    assignmentId: assignments[0].id,
    workDate: thisWeek,
    hoursWorked: 8,
    breakMinutes: 45,
    comment: "Sprintplanering och API-integration",
    status: "draft",
  }),
  entry({
    consultantId: CURRENT_CONSULTANT_ID,
    assignmentId: assignments[0].id,
    workDate: addDays(thisWeek, 1),
    hoursWorked: 8,
    breakMinutes: 30,
    comment: "Buggfix i orderflödet",
    status: "draft",
  }),
  entry({
    consultantId: CURRENT_CONSULTANT_ID,
    assignmentId: assignments[0].id,
    workDate: addDays(thisWeek, 2),
    startTime: "08:00",
    endTime: "15:00",
    hoursWorked: 6.5,
    breakMinutes: 30,
    status: "draft",
  }),
  entry({
    consultantId: CURRENT_CONSULTANT_ID,
    assignmentId: assignments[1].id,
    workDate: addDays(thisWeek, 2),
    startTime: "16:00",
    endTime: "18:00",
    hoursWorked: 2,
    breakMinutes: 0,
    comment: "Akut driftstörning kvällstid",
    status: "draft",
  }),
  ...[0, 1, 2, 3, 4].map((i) =>
    entry({
      consultantId: CURRENT_CONSULTANT_ID,
      assignmentId: assignments[0].id,
      workDate: addDays(lastWeek, i),
      hoursWorked: 8,
      breakMinutes: 45,
      status: "submitted",
    }),
  ),
  ...[0, 1, 2, 3, 4].map((i) =>
    entry({
      consultantId: CURRENT_CONSULTANT_ID,
      assignmentId: assignments[0].id,
      workDate: addDays(twoWeeksAgo, i),
      hoursWorked: 8,
      breakMinutes: 45,
      status: "approved",
    }),
  ),
  ...[0, 1, 2, 3].map((i) =>
    entry({
      consultantId: "11111111-1111-4111-8111-000000000002",
      assignmentId: assignments[2].id,
      workDate: addDays(lastWeek, i),
      hoursWorked: 9,
      breakMinutes: 60,
      status: "submitted",
    }),
  ),
  ...[0, 1, 2, 3, 4].map((i) =>
    entry({
      consultantId: "11111111-1111-4111-8111-000000000003",
      assignmentId: assignments[3].id,
      workDate: addDays(lastWeek, i),
      hoursWorked: 6,
      breakMinutes: 30,
      status: "submitted",
    }),
  ),
  ...[0, 1, 2].map((i) =>
    entry({
      consultantId: "11111111-1111-4111-8111-000000000004",
      assignmentId: assignments[4].id,
      workDate: addDays(lastWeek, i),
      hoursWorked: 8.5,
      breakMinutes: 30,
      status: "submitted",
    }),
  ),
  ...[0, 1].map((i) =>
    entry({
      consultantId: "11111111-1111-4111-8111-000000000004",
      assignmentId: assignments[4].id,
      workDate: addDays(twoWeeksAgo, i),
      hoursWorked: 9,
      breakMinutes: 30,
      comment: "Saknar underlag för resterande dagar",
      status: "rejected",
    }),
  ),
  ...[0, 1, 2, 3, 4].map((i) =>
    entry({
      consultantId: "11111111-1111-4111-8111-000000000003",
      assignmentId: assignments[3].id,
      workDate: addDays(twoWeeksAgo, i),
      hoursWorked: 7.5,
      breakMinutes: 30,
      status: "approved",
    }),
  ),
];
