import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Clock3, Building2, FileClock } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-state";
import { addDays, currentWeekStart, formatHours, monthKey } from "@/lib/date";
import { buildWeekSummaries } from "@/lib/week-summary";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Min översikt – TeamPower Tidrapportering" },
      {
        name: "description",
        content:
          "Se dina rapporterade timmar denna vecka, dina aktiva uppdrag och status på dina tidrapporter.",
      },
      { property: "og:title", content: "Min översikt – TeamPower Tidrapportering" },
      {
        property: "og:description",
        content: "Rapporterade timmar, uppdrag och attestsstatus för konsulter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsultantDashboard,
});

function ConsultantDashboard() {
  const {
    entries,
    assignments,
    currentConsultantId,
    users,
    clientName,
    assignmentName,
    clientOfAssignment,
  } = useApp();

  const me = users.find((u) => u.id === currentConsultantId);
  const myEntries = entries.filter((e) => e.consultantId === currentConsultantId);
  const weekStart = currentWeekStart();
  const weekEnd = addDays(weekStart, 6);
  const month = monthKey(weekStart);

  const weekHours = myEntries
    .filter((e) => e.workDate >= weekStart && e.workDate <= weekEnd)
    .reduce((s, e) => s + e.hoursWorked, 0);
  const monthHours = myEntries
    .filter((e) => e.workDate.startsWith(month))
    .reduce((s, e) => s + e.hoursWorked, 0);
  const draftHours = myEntries
    .filter((e) => e.status === "draft")
    .reduce((s, e) => s + e.hoursWorked, 0);

  const myAssignments = assignments.filter(
    (a) => a.consultantId === currentConsultantId && a.status === "active",
  );
  const primary = myAssignments[0];
  const weeks = buildWeekSummaries(myEntries, assignments).slice(0, 6);
  const recent = [...myEntries]
    .sort((a, b) => b.workDate.localeCompare(a.workDate))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            Hej {me?.fullName.split(" ")[0] ?? ""}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Vecka {weekStart} – {weekEnd}
          </p>
        </div>
        <Button asChild>
          <Link to="/tidrapportering">Rapportera tid</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Timmar denna vecka"
          value={formatHours(weekHours)}
          icon={Clock3}
          hint="Mål 40 h"
        />
        <StatCard label="Timmar denna månad" value={formatHours(monthHours)} icon={CalendarClock} />
        <StatCard
          label="Ej inskickat"
          value={formatHours(draftHours)}
          icon={FileClock}
          hint="Utkast som väntar på inskick"
        />
        <StatCard
          label="Aktiva uppdrag"
          value={`${myAssignments.length} st`}
          hint={
            primary
              ? `${clientName(primary.clientId)}${primary.hourlyRate ? ` · ${primary.hourlyRate} kr/h` : ""}`
              : undefined
          }
          icon={Building2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Senaste tidposter</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Uppdrag</TableHead>
                  <TableHead className="text-right">Timmar</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.workDate}</TableCell>
                    <TableCell>
                      <span className="block">{assignmentName(e.assignmentId)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {clientOfAssignment(e.assignmentId)?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatHours(e.hoursWorked)}</TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Veckor</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Uppdrag</TableHead>
                  <TableHead className="text-right">Timmar</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.map((w) => (
                  <TableRow key={w.key}>
                    <TableCell className="font-medium">{w.period}</TableCell>
                    <TableCell>{assignmentName(w.assignmentId)}</TableCell>
                    <TableCell className="text-right">{formatHours(w.totalHours)}</TableCell>
                    <TableCell>
                      <StatusBadge status={w.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
