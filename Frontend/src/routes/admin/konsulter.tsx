import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ROLE_LABELS } from "@/lib/api/types";
import { formatHours } from "@/lib/date";

export const Route = createFileRoute("/admin/konsulter")({
  head: () => ({
    meta: [
      { title: "Konsulter – TeamPower Group" },
      {
        name: "description",
        content: "Lista över användare och konsulter, deras aktiva uppdrag, roll och status.",
      },
      { property: "og:title", content: "Konsulter – TeamPower Group" },
      {
        property: "og:description",
        content: "Överblick över bemanningen och konsulternas uppdrag.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsultantsOverview,
});

function ConsultantsOverview() {
  const { users, assignments, entries, clientName } = useApp();
  const [query, setQuery] = useState("");

  const rows = users.filter((u) =>
    `${u.fullName} ${u.email} ${ROLE_LABELS[u.role]}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Konsulter</h1>
        <p className="text-sm text-muted-foreground">{rows.length} användare</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Bemanningslista</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 sm:w-64"
              placeholder="Sök namn, e-post eller roll"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>Aktiva uppdrag</TableHead>
                <TableHead className="text-right">Rapporterade timmar</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => {
                const active = assignments.filter(
                  (a) => a.consultantId === u.id && a.status === "active",
                );
                const hours = entries
                  .filter((e) => e.consultantId === u.id)
                  .reduce((s, e) => s + e.hoursWorked, 0);
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <span className="font-medium">{u.fullName}</span>
                      <span className="block text-xs text-muted-foreground">{u.email}</span>
                    </TableCell>
                    <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                    <TableCell>
                      {active.length === 0 ? (
                        <span className="text-muted-foreground">Inget aktivt uppdrag</span>
                      ) : (
                        active.map((a) => (
                          <span key={a.id} className="block">
                            {a.name}
                            <span className="block text-xs text-muted-foreground">
                              {clientName(a.clientId)}
                            </span>
                          </span>
                        ))
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatHours(hours)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          u.isActive
                            ? "border-success/30 bg-success-soft text-success"
                            : "border-border bg-muted text-muted-foreground"
                        }
                      >
                        {u.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
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
