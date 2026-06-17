import { describe, expect, it } from "vitest";
import {
  addRecurrenceDates,
  validateBookingDates,
  DEFAULT_BOOKING_RULES,
} from "@/lib/booking-rules";

describe("validateBookingDates", () => {
  it("rejette une fin avant le début", () => {
    const start = new Date("2026-07-01T10:00:00");
    const end = new Date("2026-07-01T09:00:00");
    expect(validateBookingDates(start, end, DEFAULT_BOOKING_RULES)).toContain("fin");
  });

  it("accepte un créneau valide loin dans le futur", () => {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setHours(12, 0, 0, 0);
    expect(validateBookingDates(start, end, DEFAULT_BOOKING_RULES)).toBeNull();
  });
});

describe("addRecurrenceDates", () => {
  it("génère 4 occurrences hebdomadaires", () => {
    const start = new Date("2026-07-01T10:00:00");
    const end = new Date("2026-07-01T12:00:00");
    const dates = addRecurrenceDates(start, end, { frequency: "weekly", count: 4 });
    expect(dates).toHaveLength(4);
    expect(dates[1].start.getDate()).toBe(8);
  });
});
