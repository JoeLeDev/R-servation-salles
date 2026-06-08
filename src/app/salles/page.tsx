import { Suspense } from "react";
import { getRooms } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { RoomType } from "@/types/database";
import { RoomCard } from "@/components/rooms/room-card";
import { RoomFilters } from "@/components/rooms/room-filters";

type SallesPageProps = {
  searchParams: Promise<{ type?: string; q?: string }>;
};

export default async function SallesPage({ searchParams }: SallesPageProps) {
  const params = await searchParams;
  const type = (params.type as RoomType | "all" | undefined) ?? "all";
  const search = params.q;

  const rooms = await getRooms({
    type: type === "all" ? undefined : type,
    search,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Nos salles</h1>
        <p className="mt-2 text-muted-foreground">
          {rooms.length} espace{rooms.length > 1 ? "s" : ""} disponible
          {rooms.length > 1 ? "s" : ""} — sélectionnez une salle pour faire
          votre demande.
        </p>
      </div>

      <Suspense>
        <RoomFilters />
      </Suspense>

      {!isSupabaseConfigured() && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Mode démo</strong> — Supabase n&apos;est pas correctement
          configuré (URL ou clé invalide). Les 22 salles s&apos;affichent
          localement. Mettez à jour votre fichier <code>.env</code> avec
          l&apos;URL et la clé <strong>anon</strong> de votre projet Supabase.
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Aucune salle trouvée.
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
