import type { RoomBlackout } from "@/types/database";

export function expandBlackoutOccurrences(
  blackout: RoomBlackout,
  rangeFrom: Date,
  rangeTo: Date
): { start: Date; end: Date; title: string }[] {
  const duration = new Date(blackout.end_at).getTime() - new Date(blackout.start_at).getTime();
  const occurrences: { start: Date; end: Date; title: string }[] = [];

  const addIfOverlaps = (start: Date, end: Date) => {
    if (end > rangeFrom && start < rangeTo) {
      occurrences.push({ start, end, title: blackout.title });
    }
  };

  const baseStart = new Date(blackout.start_at);
  const baseEnd = new Date(blackout.end_at);

  if (blackout.recurrence_frequency !== "weekly") {
    addIfOverlaps(baseStart, baseEnd);
    return occurrences;
  }

  const until = blackout.recurrence_until
    ? new Date(blackout.recurrence_until)
    : rangeTo;

  let cursor = new Date(baseStart);
  let cursorEnd = new Date(baseEnd);

  while (cursor <= until && cursor < rangeTo) {
    addIfOverlaps(new Date(cursor), new Date(cursorEnd));
    cursor.setDate(cursor.getDate() + 7);
    cursorEnd = new Date(cursor.getTime() + duration);
  }

  return occurrences;
}
