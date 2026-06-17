"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent, Room } from "@/types/database";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays } from "date-fns";

type CalendarPageClientProps = {
  events: CalendarEvent[];
  rooms: Room[];
  weekParam: string;
  roomId?: string;
};

export function CalendarPageClient({
  events,
  rooms,
  weekParam,
  roomId,
}: CalendarPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekStart = weekParam ? new Date(weekParam) : startOfWeek(new Date(), { weekStartsOn: 1 });

  function navigateWeek(delta: number) {
    const next = addDays(weekStart, delta * 7);
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", format(next, "yyyy-MM-dd"));
    router.push(`/calendrier?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 text-center font-medium capitalize">
            {format(weekStart, "MMMM yyyy", { locale: fr })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Select
          value={roomId ?? "all"}
          onValueChange={(v) => {
            const params = new URLSearchParams(searchParams.toString());
            if (v === "all") params.delete("room");
            else params.set("room", v);
            router.push(`/calendrier?${params.toString()}`);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Toutes les salles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les salles</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-emerald-500" /> Approuvée
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-amber-500" /> En attente
        </span>
      </div>

      <CalendarView events={events} weekStart={weekStart} />

      <p className="text-sm text-muted-foreground">
        <Link href="/salles" className="underline">
          Faire une demande de réservation →
        </Link>
      </p>
    </div>
  );
}
