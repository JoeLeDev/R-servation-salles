"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { AvailabilitySlot, BookingRules } from "@/types/database";
import { Badge } from "@/components/ui/badge";

type RoomAvailabilityCalendarProps = {
  slots: AvailabilitySlot[];
  rules: BookingRules;
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
      <h3 className="mb-1 font-semibold">Disponibilités (14 prochains jours)</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Réservation au moins {rules.min_advance_hours} h à l&apos;avance · durée max{" "}
        {rules.max_duration_hours} h
      </p>
      <div className="space-y-2">
        {days.map((day) => {
          const daySlots = slots.filter((s) => {
            const start = new Date(s.start_at);
            return (
              start.getFullYear() === day.getFullYear() &&
              start.getMonth() === day.getMonth() &&
              start.getDate() === day.getDate()
            );
          });

          const dayEnd = new Date(day);
          dayEnd.setHours(23, 59, 59, 999);
          const tooSoon = dayEnd < minBookable;

          return (
            <div
              key={day.toISOString()}
              className="flex flex-wrap items-start gap-2 border-b pb-2 last:border-0"
            >
              <span className="w-28 shrink-0 text-sm font-medium capitalize">
                {format(day, "EEE d MMM", { locale: fr })}
              </span>
              <div className="flex flex-1 flex-wrap gap-1">
                {tooSoon ? (
                  <Badge variant="outline" className="text-muted-foreground">
                    Trop proche
                  </Badge>
                ) : daySlots.length === 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                    Libre
                  </Badge>
                ) : (
                  daySlots.map((slot, idx) => (
                    <Badge
                      key={`${slot.start_at}-${idx}`}
                      variant={slot.type === "blackout" ? "destructive" : "outline"}
                    >
                      {format(new Date(slot.start_at), "HH:mm")}–
                      {format(new Date(slot.end_at), "HH:mm")}
                      {slot.type === "blackout" ? " bloqué" : slot.status === "pending" ? " en attente" : " réservé"}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
