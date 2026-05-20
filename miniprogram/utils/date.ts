export function formatDateLabel(date: string): string {
  return date.replace(/-/g, ".");
}

export function getDayDiffFromToday(date: string, today = "2026-05-20"): number {
  const target = new Date(`${date}T00:00:00+08:00`).getTime();
  const base = new Date(`${today}T00:00:00+08:00`).getTime();

  return Math.round((target - base) / (24 * 60 * 60 * 1000));
}
