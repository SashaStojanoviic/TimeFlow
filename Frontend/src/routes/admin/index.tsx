import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Briefcase, CheckCircle2, Clock3, Users, Wallet } from "lucide-react";
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
import { formatHours } from "@/lib/date";
import { buildWeekSummaries } from "@/lib/week-summary";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Adminöversikt – TeamPower Group" },
      {
        name: "description",
        content:
          "Nyckeltal för bemanningen: attesterade timmar, attestkö, aktiva konsulter och uppdrag.",
      },
      { property: "og:title", content: "Adminöversikt – TeamPower Group" },
      {
        property: "og:description",
        content: "Konsultchefens överblick över timmar, attester och beläggning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { entries, assignments, clients, consultants, userName, assignmentById, assignmentName } =
    useApp();

  const approvedEntries = entries.filter((e) => e.status === "approved");
  const billedHours = approvedEntries.reduce((s, e) => s + e.hoursWorked, 0);
  const revenue = approvedEntries.reduce(
    (s, e) => s + e.hoursWorked * (assignmentById(e.assignmentId)?.hourlyRate ?? 0),
    0,
  );
  const pendingWeeks = buildWeekSummaries(
    entries.filter((e) => e.status === "submitted"),
    assignments,
  );
  const activeConsultants = consultants.filter((c) => c.isActive).length;
  const clientsWithoutAssignment = clients.filter(
    (c) =>
      c.isActive && !assignments.some((a) => a.clientId === c.id && a.status === "active"),
  ).length;

  const latest = buildWeekSummaries(
    entries.filter((e) => e.status !== "draft"),
    assignments,
  ).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            Adminöversikt
          </h1>
          <p className="text-sm text-muted-foreground">TeamPower Group Sweden AB</p>
        </div>
        <Button asChild>
          <Link to="/admin/attest">Till attestkön</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attesterade timmar"
          value={formatHours(billedHours)}
          hint={`${Math.round(revenue).toLocaleString("sv-SE")} kr fakturerbart`}
          icon={Wallet}
        />
        <StatCard label="Veckor att attestera" value={`${pendingWeeks.length} st`} icon={Clock3} />
        <StatCard label="Aktiva konsulter" value={`${activeConsultants} st`} icon={Users} />
        <StatCard
          label="Kunder utan aktivt uppdrag"
          value={`${clientsWithoutAssignment} st`}
          icon={Building2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Aktiva uppdrag"
          value={`${assignments.filter((a) => a.status === "active").length} st`}
          icon={Briefcase}
        />
        <StatCard
          label="Registrerade tidposter"
          value={`${entries.length} st`}
          icon={CheckCircle2}
        />
      </div>

      <Card>
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <CardTitle className="truncate text-base">Senaste inskickade veckor</CardTitle>
          <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Konsult</TableHead>
                <TableHead>Uppdrag</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Timmar</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latest.map((w) => (
                <TableRow key={w.key}>
                  <TableCell className="font-medium">{userName(w.consultantId)}</TableCell>
                  <TableCell>{assignmentName(w.assignmentId)}</TableCell>
                  <TableCell>{w.period}</TableCell>
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
  );
}
