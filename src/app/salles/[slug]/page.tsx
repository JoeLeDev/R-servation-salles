import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Ruler, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRoomBySlug, getBookingRules, getRoomAvailability } from "@/lib/data";
import { getRoomExtendedDetails } from "@/lib/room-details";
import { parseDatetimeParam, toDatetimeLocalValue } from "@/lib/datetime-local";
import { RoomAvailabilityCalendar } from "@/components/rooms/room-availability-calendar";
import { RoomDetailsPanel } from "@/components/rooms/room-details-panel";
import { RoomReservationPanel } from "@/components/rooms/room-reservation-panel";
import {
  formatCapacity,
  formatPrice,
  formatRoomType,
  formatSurface,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RoomPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const room = await getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const supabase = await createClient();
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;

  const rangeFrom = new Date();
  const rangeTo = new Date();
  rangeTo.setDate(rangeTo.getDate() + 14);

  const [availability, rules] = await Promise.all([
    getRoomAvailability(room.id, rangeFrom.toISOString(), rangeTo.toISOString()),
    getBookingRules(),
  ]);

  const extendedDetails = getRoomExtendedDetails(slug);

  const parsedStart = parseDatetimeParam(query.start);
  const parsedEnd = parseDatetimeParam(query.end);
  const defaultStart = parsedStart
    ? toDatetimeLocalValue(parsedStart)
    : undefined;
  const defaultEnd = parsedEnd ? toDatetimeLocalValue(parsedEnd) : undefined;

  const redirectPath =
    query.start || query.end
      ? `/salles/${slug}?${new URLSearchParams({
          ...(query.start ? { start: query.start } : {}),
          ...(query.end ? { end: query.end } : {}),
        }).toString()}`
      : `/salles/${slug}`;
  const loginHref = `/connexion?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:pb-8">
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link href="/salles">
          <ArrowLeft className="mr-2 size-4" />
          Retour aux salles
        </Link>
      </Button>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {room.name}
          </h1>
          <Badge variant="secondary">{formatRoomType(room.room_type)}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Service : {room.services?.name}
        </p>
        {(extendedDetails?.summary || room.description) && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {extendedDetails?.summary ?? room.description}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
            <Ruler className="size-3.5 text-muted-foreground" />
            <span>{formatSurface(room.surface_sqm)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
            <Users className="size-3.5 text-muted-foreground" />
            <span>{formatCapacity(room.capacity)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
            <Building2 className="size-3.5 text-muted-foreground" />
            <span>{formatPrice(room.pricing_type, room.base_price)}</span>
          </div>
        </dl>

        {(room.equipment?.length ?? 0) > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Équipements : </span>
            {room.equipment?.join(" · ")}
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="order-2 space-y-5 lg:order-1 lg:col-span-7">
          <RoomAvailabilityCalendar
            slots={availability}
            rules={rules}
            roomSlug={slug}
          />

          {extendedDetails ? (
            <RoomDetailsPanel details={extendedDetails} />
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Fiche détaillée à venir pour cette salle.
            </div>
          )}
        </div>

        <RoomReservationPanel
          room={room}
          isLoggedIn={!!user}
          loginHref={loginHref}
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
        />
      </div>
    </div>
  );
}
