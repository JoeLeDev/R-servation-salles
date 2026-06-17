"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { AvailabilitySlot, BookingRules } from "@/types/database";
import { cn } from "@/lib/utils";

type RoomAvailabilityCalendarProps = {
  slots: AvailabilitySlot[];
  rules: BookingRules;
};

function dayStatus(
  day: Date,
  daySlots: AvailabilitySlot[],
  minBookable: Date
): "too-soon" | "free" | "busy" | "blackout" {
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  if (dayEnd < minBookable) return "too-soon";
  if (daySlots.length === 0) return "free";
  if (daySlots.some((s) => s.type === "blackout")) return "blackout";
  return "busy";
}

const statusStyles = {
  "too-soon": "bg-muted text-muted-foreground",
  free: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  busy: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  blackout: "bg-destructive/15 text-destructive",
};

const statusLabels = {
  "too-soon": "—",
  free: "Libre",
  busy: "Pris",
  blackout: "Bloqué",
};

export function RoomAvailabilityCalendar({
  slots,
  rules,
}: RoomAvailabilityCalendarProps) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

  const minBookable = new Date();
  minBookable.setHours(minBookable.getHours() + rules.min_advance_hours);

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">Disponibilités</h3>
        <p className="text-xs text-muted-foreground">
          {rules.min_advance_hours} h min. · max {rules.max_duration_hours} h
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const daySlots = slots.filter((s) => {
            const start = new Date(s.start_at);
            return (
              start.getFullYear() === day.getFullYear() &&
              start.getMonth() === day.getMonth() &&
              start.getDate() === day.getDate()
            );
          });
          const status = dayStatus(day, daySlots, minBookable);

          return (
            <div
              key={day.toISOString()}
              className="flex flex-col items-center gap-1 rounded-md border bg-card p-1.5 text-center"
              title={
                daySlots.length > 0
                  ? daySlots
                      .map(
                        (s) =>
                          `${format(new Date(s.start_at), "HH:mm")}–${format(new Date(s.end_at), "HH:mm")}`
                      )
                      .join(", ")
                  : undefined
              }
            >
              <span className="text-[10px] font-medium capitalize text-muted-foreground">
                {format(day, "EEE", { locale: fr })}
              </span>
              <span className="text-xs font-semibold">{format(day, "d")}</span>
              <span
                className={cn(
                  "rounded px-1 py-0.5 text-[9px] font-medium leading-tight",
                  statusStyles[status]
                )}
              >
                {statusLabels[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
