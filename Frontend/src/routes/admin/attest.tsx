import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Download, Search, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-state";
import { buildVismaCsv, downloadCsv } from "@/lib/api/client";
import type { TimeEntryStatus } from "@/lib/api/types";
import { formatHours } from "@/lib/date";
import { buildWeekSummaries } from "@/lib/week-summary";

export const Route = createFileRoute("/admin/attest")({
  head: () => ({
    meta: [
      { title: "Attestkö – TeamPower Group" },
      {
        name: "description",
        content:
          "Attestera eller avvisa inskickade tidrapporter per vecka och exportera löneunderlag till Visma.",
      },
      { property: "og:title", content: "Attestkö – TeamPower Group" },
      {
        property: "og:description",
        content: "Hantera inskickade tidrapporter och exportera löneunderlag som CSV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApprovalQueue,
});

function ApprovalQueue() {
  const {
    entries,
    assignments,
    clients,
    users,
    userName,
    assignmentName,
    clientOfAssignment,
    setEntriesStatus,
  } = useApp();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TimeEntryStatus | "all">("submitted");

  const rows = buildWeekSummaries(
    entries.filter((e) => e.status !== "draft"),
    assignments,
  )
    .filter((w) => (status === "all" ? true : w.status === status))
    .filter((w) => {
      const q = query.trim().toLowerCase();
      return (
        !q ||
        userName(w.consultantId).toLowerCase().includes(q) ||
        assignmentName(w.assignmentId).toLowerCase().includes(q) ||
        (clientOfAssignment(w.assignmentId)?.name ?? "").toLowerCase().includes(q) ||
        w.period.toLowerCase().includes(q)
      );
    });

  async function act(ids: string[], next: TimeEntryStatus, label: string) {
    await setEntriesStatus(ids, next);
    toast.success(`Tidrapporten ${label}.`);
  }

  function exportCsv() {
    const csv = buildVismaCsv(rows, users, clients, assignments);
    downloadCsv(`visma-loneunderlag-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`${rows.length} rader exporterade till Visma-format.`);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">Attestkö</h1>
          <p className="text-sm text-muted-foreground">{rows.length} veckorapporter i urvalet</p>
        </div>
        <Button onClick={exportCsv} variant="outline" className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Exportera till Visma (.csv)
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Inskickade tidrapporter</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 sm:w-64"
                placeholder="Sök konsult, uppdrag eller period"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as TimeEntryStatus | "all")}>
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla statusar</SelectItem>
                <SelectItem value="submitted">Väntar på attest</SelectItem>
                <SelectItem value="approved">Attesterad</SelectItem>
                <SelectItem value="rejected">Avvisad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Konsult</TableHead>
                <TableHead>Uppdrag</TableHead>
                <TableHead>Kund</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Timmar</TableHead>
                <TableHead className="text-right">Dagar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Åtgärd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.key}>
                  <TableCell className="font-medium">{userName(w.consultantId)}</TableCell>
                  <TableCell>{assignmentName(w.assignmentId)}</TableCell>
                  <TableCell>{clientOfAssignment(w.assignmentId)?.name ?? "–"}</TableCell>
                  <TableCell>
                    {w.period}
                    <span className="block text-xs text-muted-foreground">{w.weekStart}</span>
                  </TableCell>
                  <TableCell className="text-right">{formatHours(w.totalHours)}</TableCell>
                  <TableCell className="text-right">{w.entryIds.length}</TableCell>
                  <TableCell>
                    <StatusBadge status={w.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Attestera"
                        onClick={() => act(w.entryIds, "approved", "attesterades")}
                      >
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Avvisa"
                        onClick={() => act(w.entryIds, "rejected", "avvisades")}
                      >
                        <X className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Inga tidrapporter matchar filtret.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
