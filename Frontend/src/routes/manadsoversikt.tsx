import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock3, FileClock } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
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
import { formatHours, monthKey, monthLabel } from "@/lib/date";
import { buildWeekSummaries } from "@/lib/week-summary";

export const Route = createFileRoute("/manadsoversikt")({
  head: () => ({
    meta: [
      { title: "Månadssammanställning – TeamPower Group" },
      {
        name: "description",
        content: "Sammanställning av rapporterade, inskickade och attesterade timmar per månad.",
      },
      { property: "og:title", content: "Månadssammanställning – TeamPower Group" },
      {
        property: "og:description",
        content: "Följ upp inskickade kontra attesterade timmar månad för månad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonthlySummary,
});

function MonthlySummary() {
  const { entries, assignments, currentConsultantId, assignmentName, clientOfAssignment } =
    useApp();

  const mine = entries.filter((e) => e.consultantId === currentConsultantId);
  const submitted = mine
    .filter((e) => e.status === "submitted")
    .reduce((s, e) => s + e.hoursWorked, 0);
  const approved = mine
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + e.hoursWorked, 0);
  const drafts = mine.filter((e) => e.status === "draft").length;

  const months = [...new Set(mine.map((e) => monthKey(e.workDate)))].sort((a, b) =>
    b.localeCompare(a),
  );
  const weeks = buildWeekSummaries(mine, assignments);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Månadssammanställning</h1>
        <p className="text-sm text-muted-foreground">
          Rapporterade timmar per månad, vecka och uppdrag
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Inskickade timmar" value={formatHours(submitted)} icon={FileClock} />
        <StatCard label="Attesterade timmar" value={formatHours(approved)} icon={CheckCircle2} />
        <StatCard label="Utkast kvar" value={`${drafts} st`} icon={Clock3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((m) => {
          const hours = mine
            .filter((e) => e.workDate.startsWith(m))
            .reduce((s, e) => s + e.hoursWorked, 0);
          return (
            <Card key={m}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base capitalize">{monthLabel(m)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatHours(hours)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alla veckor</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Uppdrag</TableHead>
                <TableHead>Kund</TableHead>
                <TableHead className="text-right">Timmar</TableHead>
                <TableHead className="text-right">Rast</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map((w) => (
                <TableRow key={w.key}>
                  <TableCell className="font-medium">{w.period}</TableCell>
                  <TableCell>{assignmentName(w.assignmentId)}</TableCell>
                  <TableCell>{clientOfAssignment(w.assignmentId)?.name ?? "–"}</TableCell>
                  <TableCell className="text-right">{formatHours(w.totalHours)}</TableCell>
                  <TableCell className="text-right">{w.breakMinutes} min</TableCell>
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
