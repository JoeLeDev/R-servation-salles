import type { BookingRules } from "@/types/database";

export const DEFAULT_BOOKING_RULES: BookingRules = {
  min_duration_minutes: 30,
  max_duration_hours: 8,
  min_advance_hours: 24,
  cancellation_hours: 2,
  require_approval: true,
};

export function validateBookingDates(
  start: Date,
  end: Date,
  rules: BookingRules
): string | null {
  const now = new Date();
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = durationMs / 60_000;
  const advanceHours = (start.getTime() - now.getTime()) / 3_600_000;

  if (end <= start) {
    return "La date de fin doit être après la date de début.";
  }

  if (durationMinutes < rules.min_duration_minutes) {
    return `Durée minimum : ${rules.min_duration_minutes} minutes.`;
  }

  if (durationMinutes > rules.max_duration_hours * 60) {
    return `Durée maximum : ${rules.max_duration_hours} heures.`;
  }

  if (advanceHours < rules.min_advance_hours) {
    return `Réservez au moins ${rules.min_advance_hours} h à l'avance.`;
  }

  return null;
}

export function addRecurrenceDates(
  start: Date,
  end: Date,
  rule: { frequency: "weekly" | "monthly"; count: number }
): { start: Date; end: Date }[] {
  const dates: { start: Date; end: Date }[] = [];
  const duration = end.getTime() - start.getTime();

  for (let i = 0; i < rule.count; i++) {
    const s = new Date(start);
    const e = new Date(start.getTime() + duration);

    if (rule.frequency === "weekly") {
      s.setDate(s.getDate() + i * 7);
      e.setDate(e.getDate() + i * 7);
    } else {
      s.setMonth(s.getMonth() + i);
      e.setMonth(e.getMonth() + i);
    }

    dates.push({ start: s, end: e });
  }

  return dates;
}
