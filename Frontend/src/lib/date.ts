/** Datumhjälp för veckobaserad tidrapportering (måndag som veckostart). */

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Måndag i veckan för angivet datum, yyyy-MM-dd */
export function currentWeekStart(base: Date = new Date()): string {
  const d = new Date(base);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toISO(d);
}

export function weekStartOf(iso: string): string {
  return currentWeekStart(new Date(`${iso}T00:00:00`));
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** ISO-veckoetikett, t.ex. 2026-V32 */
export function isoWeek(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${target.getUTCFullYear()}-V${String(week).padStart(2, "0")}`;
}

export const MONTHS = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

/** "2026-08" -> "augusti 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export const DAY_LABELS = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];

export function formatHours(h: number): string {
  return `${Number(h.toFixed(2)).toLocaleString("sv-SE")} h`;
}
