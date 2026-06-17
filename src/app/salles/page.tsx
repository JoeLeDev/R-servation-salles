import { Suspense } from "react";
import { getRooms } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { RoomType } from "@/types/database";
import { RoomCard } from "@/components/rooms/room-card";
import { RoomFilters } from "@/components/rooms/room-filters";

type SallesPageProps = {
  searchParams: Promise<{
    type?: string;
    q?: string;
    cap?: string;
    surface?: string;
    price?: string;
    equip?: string;
  }>;
};

export default async function SallesPage({ searchParams }: SallesPageProps) {
  const params = await searchParams;
  const type = (params.type as RoomType | "all" | undefined) ?? "all";

  const rooms = await getRooms({
    type: type === "all" ? undefined : type,
    search: params.q,
    minCapacity: params.cap ? Number(params.cap) : undefined,
    minSurface: params.surface ? Number(params.surface) : undefined,
    maxPrice: params.price ? Number(params.price) : undefined,
    equipment: params.equip,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Nos salles</h1>
        <p className="mt-2 text-muted-foreground">
          {rooms.length} espace{rooms.length > 1 ? "s" : ""} disponible
          {rooms.length > 1 ? "s" : ""}
        </p>
      </div>

      <Suspense>
        <RoomFilters />
      </Suspense>

      {!isSupabaseConfigured() && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          Mode démo — configurez Supabase pour les demandes en production.
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Aucune salle ne correspond à vos critères.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
