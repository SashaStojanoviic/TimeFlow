import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { addDays, currentWeekStart, DAY_LABELS, formatHours, isoWeek } from "@/lib/date";
import { buildWeekSummaries } from "@/lib/week-summary";

export const Route = createFileRoute("/tidrapportering")({
  head: () => ({
    meta: [
      { title: "Tidrapportering – TeamPower Group" },
      {
        name: "description",
        content:
          "Veckovy och dagsformulär för att rapportera arbetade timmar, arbetstider och raster per uppdrag.",
      },
      { property: "og:title", content: "Tidrapportering – TeamPower Group" },
      {
        property: "og:description",
        content: "Rapportera timmar per dag och skicka in veckan för attest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimeLogging,
});

function TimeLogging() {
  const {
    entries,
    assignments,
    currentConsultantId,
    addEntry,
    removeEntry,
    setEntriesStatus,
    assignmentName,
    clientOfAssignment,
  } = useApp();

  const myAssignments = assignments.filter(
    (a) => a.consultantId === currentConsultantId && a.status !== "cancelled",
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(currentWeekStart(), weekOffset * 7);

  const [form, setForm] = useState({
    workDate: weekStart,
    assignmentId: "",
    startTime: "08:00",
    endTime: "17:00",
    hoursWorked: "8",
    breakMinutes: "30",
    comment: "",
  });
  const assignmentId = form.assignmentId || myAssignments[0]?.id || "";

  const week = useMemo(
    () => DAY_LABELS.map((label, i) => ({ label, date: addDays(weekStart, i) })),
    [weekStart],
  );
  const myEntries = entries.filter((e) => e.consultantId === currentConsultantId);
  const weekRows = week.map((d) => myEntries.filter((e) => e.workDate === d.date));
  const flat = weekRows.flat();
  const total = flat.reduce((s, e) => s + e.hoursWorked, 0);
  const summaries = buildWeekSummaries(
    myEntries.filter((e) => e.workDate >= weekStart && e.workDate <= addDays(weekStart, 6)),
    assignments,
  );
  const weekStatus = summaries[0]?.status;
  const draftIds = flat.filter((e) => e.status === "draft").map((e) => e.id);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const hours = Number(form.hoursWorked);
    if (!assignmentId) {
      toast.error("Välj ett uppdrag.");
      return;
    }
    if (!hours || hours <= 0 || hours > 24) {
      toast.error("Ange ett giltigt antal timmar (0–24).");
      return;
    }
    const breakMinutes = Number(form.breakMinutes) || 0;
    if (breakMinutes < 0 || breakMinutes > 1440) {
      toast.error("Rast måste vara mellan 0 och 1440 minuter.");
      return;
    }
    const duplicate = myEntries.some(
      (e) => e.assignmentId === assignmentId && e.workDate === form.workDate,
    );
    if (duplicate) {
      toast.error("Det finns redan en tidpost för det uppdraget och datumet.");
      return;
    }
    await addEntry({
      consultantId: currentConsultantId,
      assignmentId,
      workDate: form.workDate,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      hoursWorked: hours,
      breakMinutes,
      comment: form.comment || null,
    });
    toast.success("Tidposten sparades som utkast.");
    setForm((f) => ({ ...f, comment: "" }));
  }

  async function submitWeek() {
    if (draftIds.length === 0) {
      toast.error("Inga utkast att skicka in för veckan.");
      return;
    }
    await setEntriesStatus(draftIds, "submitted");
    toast.success(`${draftIds.length} tidposter skickades för attest.`);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            Tidrapportering
          </h1>
          <p className="text-sm text-muted-foreground">
            {isoWeek(weekStart)} · {weekStart} – {addDays(weekStart, 6)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Föregående vecka"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Nästa vecka"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <CardTitle className="truncate text-base">Veckorapport</CardTitle>
          <div className="flex shrink-0 items-center gap-3">
            {weekStatus ? <StatusBadge status={weekStatus} /> : null}
            <span className="text-sm font-medium">{formatHours(total)}</span>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dag</TableHead>
                <TableHead>Uppdrag</TableHead>
                <TableHead>Tid</TableHead>
                <TableHead className="text-right">Rast</TableHead>
                <TableHead className="text-right">Timmar</TableHead>
                <TableHead className="min-w-[180px]">Kommentar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {week.map((day, i) => {
                const rows = weekRows[i];
                if (rows.length === 0) {
                  return (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">
                        {day.label}
                        <span className="ml-2 text-xs text-muted-foreground">{day.date}</span>
                      </TableCell>
                      <TableCell colSpan={7} className="text-sm text-muted-foreground">
                        Ingen tid rapporterad
                      </TableCell>
                    </TableRow>
                  );
                }
                return rows.map((e, idx) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {idx === 0 ? (
                        <>
                          {day.label}
                          <span className="ml-2 text-xs text-muted-foreground">{day.date}</span>
                        </>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span className="block">{assignmentName(e.assignmentId)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {clientOfAssignment(e.assignmentId)?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.startTime && e.endTime ? `${e.startTime}–${e.endTime}` : "–"}
                    </TableCell>
                    <TableCell className="text-right">{e.breakMinutes} min</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatHours(e.hoursWorked)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.comment ?? "–"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {e.status === "draft" || e.status === "rejected" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Ta bort"
                          onClick={() => removeEntry(e.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ny tidpost</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="workDate">Datum</Label>
              <Input
                id="workDate"
                type="date"
                value={form.workDate}
                onChange={(e) => setForm({ ...form, workDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-1 lg:col-span-2">
              <Label>Uppdrag</Label>
              <Select
                value={assignmentId}
                onValueChange={(v) => setForm({ ...form, assignmentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj uppdrag" />
                </SelectTrigger>
                <SelectContent>
                  {myAssignments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} · {clientOfAssignment(a.id)?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Starttid</Label>
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Sluttid</Label>
              <Input
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break">Rast (minuter)</Label>
              <Input
                id="break"
                type="number"
                step="5"
                min="0"
                max="1440"
                value={form.breakMinutes}
                onChange={(e) => setForm({ ...form, breakMinutes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Arbetade timmar</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={form.hoursWorked}
                onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="comment">Kommentar (valfritt)</Label>
              <Textarea
                id="comment"
                rows={2}
                placeholder="Beskriv arbetspasset..."
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Spara tidpost
              </Button>
              <Button type="button" variant="outline" onClick={submitWeek}>
                <Send className="mr-2 h-4 w-4" />
                Skicka in vecka ({draftIds.length})
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
