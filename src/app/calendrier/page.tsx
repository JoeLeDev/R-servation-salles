import { Suspense } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { getCalendarEvents, getRooms } from "@/lib/data";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

type PageProps = {
  searchParams: Promise<{ week?: string; room?: string }>;
};

export default async function CalendrierPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const weekStart = params.week
    ? startOfWeek(new Date(params.week), { weekStartsOn: 1 })
    : startOfWeek(new Date(), { weekStartsOn: 1 });

  const from = weekStart.toISOString();
  const to = addDays(weekStart, 7).toISOString();

  const [rooms, events] = await Promise.all([
    getRooms(),
    getCalendarEvents(from, to, params.room),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendrier</h1>
        <p className="mt-1 text-muted-foreground">
          Disponibilités et réservations par semaine
        </p>
      </div>
      <Suspense>
        <CalendarPageClient
          events={events}
          rooms={rooms}
          weekParam={format(weekStart, "yyyy-MM-dd")}
          roomId={params.room}
        />
      </Suspense>
    </div>
  );
}
