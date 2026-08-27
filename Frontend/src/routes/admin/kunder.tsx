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

export const Route = createFileRoute("/admin/kunder")({
  head: () => ({
    meta: [
      { title: "Kunder – TeamPower Group" },
      {
        name: "description",
        content: "Kundföretag, organisationsnummer, kontaktuppgifter och pågående uppdrag.",
      },
      { property: "og:title", content: "Kunder – TeamPower Group" },
      {
        property: "og:description",
        content: "Se kundregistret, kontaktpersoner och antal aktiva uppdrag per kund.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsOverview,
});

function ClientsOverview() {
  const { clients, assignments } = useApp();
  const [query, setQuery] = useState("");
  const rows = clients.filter((c) =>
    `${c.name} ${c.contactName ?? ""} ${c.orgNumber ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Kunder</h1>
        <p className="text-sm text-muted-foreground">{rows.length} kundföretag</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Kundregister</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 sm:w-64"
              placeholder="Sök kund eller kontaktperson"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kund</TableHead>
                <TableHead>Kontaktperson</TableHead>
                <TableHead>Kontaktuppgifter</TableHead>
                <TableHead className="text-right">Aktiva uppdrag</TableHead>
                <TableHead className="text-right">Snittpris</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const clientAssignments = assignments.filter((a) => a.clientId === c.id);
                const active = clientAssignments.filter((a) => a.status === "active");
                const rates = clientAssignments
                  .map((a) => a.hourlyRate)
                  .filter((r): r is number => typeof r === "number");
                const avg = rates.length
                  ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length)
                  : null;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="font-medium">{c.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {c.orgNumber ?? "–"}
                      </span>
                    </TableCell>
                    <TableCell>{c.contactName ?? "–"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="block">{c.contactEmail ?? "–"}</span>
                      <span className="block">{c.contactPhone ?? ""}</span>
                    </TableCell>
                    <TableCell className="text-right">{active.length}</TableCell>
                    <TableCell className="text-right">{avg ? `${avg} kr` : "–"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          c.isActive
                            ? "border-success/30 bg-success-soft text-success"
                            : "border-border bg-muted text-muted-foreground"
                        }
                      >
                        {c.isActive ? "Aktiv kund" : "Vilande"}
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
