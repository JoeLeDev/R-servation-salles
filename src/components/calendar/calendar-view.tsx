"use client";

import { useMemo } from "react";
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { CalendarEvent } from "@/types/database";
import { cn } from "@/lib/utils";

type CalendarViewProps = {
  events: CalendarEvent[];
  weekStart: Date;
};

function eventColor(status: CalendarEvent["status"]) {
  if (status === "approved") return "bg-emerald-500/90";
  return "bg-amber-500/90";
}

export function CalendarView({ events, weekStart }: CalendarViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [weekStart]);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  return (
    <div className="overflow-x-auto rounded-xl border">
      <div className="grid min-w-[700px] grid-cols-8 border-b bg-muted/40 text-sm">
        <div className="p-2 font-medium" />
        {days.map((day) => (
          <div key={day.toISOString()} className="border-l p-2 text-center">
            <div className="font-medium capitalize">
              {format(day, "EEE", { locale: fr })}
            </div>
            <div className="text-muted-foreground">{format(day, "d MMM", { locale: fr })}</div>
          </div>
        ))}
      </div>

      <div className="relative grid min-w-[700px] grid-cols-8">
        <div className="border-r">
          {hours.map((h) => (
            <div key={h} className="h-12 border-b px-2 text-xs text-muted-foreground">
              {h}:00
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day.toISOString()} className="relative border-r">
            {hours.map((h) => (
              <div key={h} className="h-12 border-b" />
            ))}
            {events
              .filter((e) => isSameDay(parseISO(e.start_at), day))
              .map((event) => {
                const start = parseISO(event.start_at);
                const end = parseISO(event.end_at);
                const top = (start.getHours() + start.getMinutes() / 60 - 8) * 48;
                const height = Math.max(
                  ((end.getTime() - start.getTime()) / 3_600_000) * 48,
                  24
                );
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "absolute left-0.5 right-0.5 z-10 overflow-hidden rounded px-1 py-0.5 text-[10px] leading-tight text-white",
                      eventColor(event.status)
                    )}
                    style={{ top: `${top}px`, height: `${height}px` }}
                    title={`${event.room_name} — ${event.title}`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="truncate opacity-90">{event.room_name}</div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
