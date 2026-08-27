import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/admin/uppdrag")({
  head: () => ({
    meta: [
      { title: "Uppdrag – TeamPower Group" },
      {
        name: "description",
        content:
          "Alla uppdrag med kund, konsult, timpris, avtalsperiod och rapporterade timmar.",
      },
      { property: "og:title", content: "Uppdrag – TeamPower Group" },
      {
        property: "og:description",
        content: "Se pågående, planerade och avslutade uppdrag i bemanningen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssignmentsOverview,
});

function AssignmentsOverview() {
  const { assignments, entries, clientName, userName } = useApp();
  const [query, setQuery] = useState("");

  const rows = assignments.filter((a) =>
    `${a.name} ${clientName(a.clientId)} ${userName(a.consultantId)}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Uppdrag</h1>
        <p className="text-sm text-muted-foreground">{rows.length} uppdrag</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Uppdragsregister</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 sm:w-64"
              placeholder="Sök uppdrag, kund eller konsult"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Uppdrag</TableHead>
                <TableHead>Kund</TableHead>
                <TableHead>Konsult</TableHead>
                <TableHead className="text-right">Timpris</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Rapporterat</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const hours = entries
                  .filter((e) => e.assignmentId === a.id)
                  .reduce((s, e) => s + e.hoursWorked, 0);
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <span className="font-medium">{a.name}</span>
                      {a.description ? (
                        <span className="block max-w-[280px] truncate text-xs text-muted-foreground">
                          {a.description}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{clientName(a.clientId)}</TableCell>
                    <TableCell>{userName(a.consultantId)}</TableCell>
                    <TableCell className="text-right">
                      {a.hourlyRate ? `${a.hourlyRate} kr` : "–"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.startDate ?? "–"} – {a.endDate ?? "tillsvidare"}
                    </TableCell>
                    <TableCell className="text-right">{formatHours(hours)}</TableCell>
                    <TableCell>
                      <AssignmentStatusBadge status={a.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
