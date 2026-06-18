import { describe, expect, it } from "vitest";
import { parseDatetimeParam, toDatetimeLocalValue } from "@/lib/datetime-local";

describe("toDatetimeLocalValue", () => {
  it("formate une date locale", () => {
    const d = new Date(2026, 6, 15, 9, 5);
    expect(toDatetimeLocalValue(d)).toBe("2026-07-15T09:05");
  });
});

describe("parseDatetimeParam", () => {
  it("parse une ISO valide", () => {
    const d = parseDatetimeParam("2026-07-15T09:00:00.000Z");
    expect(d).toBeInstanceOf(Date);
    expect(d?.getUTCHours()).toBe(9);
  });

  it("retourne null si invalide", () => {
    expect(parseDatetimeParam("")).toBeNull();
    expect(parseDatetimeParam("bad")).toBeNull();
  });
});
