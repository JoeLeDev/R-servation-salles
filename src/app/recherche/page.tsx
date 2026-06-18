import Link from "next/link";
import {
  getServices,
  searchAll,
  searchRoomsFiltered,
} from "@/lib/data";
import { formatCapacity, formatDateRange, formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/requests/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    service?: string;
    capacity?: string;
    date?: string;
  }>;
};

export default async function RecherchePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const minCapacity = params.capacity ? Number(params.capacity) : undefined;
  const hasRoomFilters =
    !!query || !!params.service || !!minCapacity || !!params.date;

  const [services, rooms, textSearch] = await Promise.all([
    getServices(),
    hasRoomFilters
      ? searchRoomsFiltered({
          q: query || undefined,
          serviceId: params.service,
          minCapacity,
          date: params.date,
        })
      : Promise.resolve([]),
    query ? searchAll(query) : Promise.resolve({ rooms: [], requests: [] }),
  ]);

  const requests = query ? textSearch.requests : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Recherche</h1>
      <p className="mt-1 mb-6 text-muted-foreground">
        Salles et demandes par mot-clé, service, capacité ou date
      </p>

      <form className="space-y-4 rounded-xl border p-4" action="/recherche" method="get">
        <div className="space-y-1.5">
          <Label htmlFor="q">Mot-clé</Label>
          <Input
            id="q"
            name="q"
            placeholder="Ex. Onyx, réunion…"
            defaultValue={query}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="service">Service</Label>
            <select
              id="service"
              name="service"
              defaultValue={params.service ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Tous</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Capacité min.</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              placeholder="Ex. 50"
              defaultValue={params.capacity ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Disponible le</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={params.date ?? ""}
            />
          </div>
        </div>

        <Button type="submit">Rechercher</Button>
      </form>

      {hasRoomFilters && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold">Salles ({rooms.length})</h2>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune salle trouvée.</p>
          ) : (
            <ul className="space-y-2">
              {rooms.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/salles/${r.slug}`}
                    className="block rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.services?.name} · {formatCapacity(r.capacity)} ·{" "}
                      {formatPrice(r.pricing_type, r.base_price)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {query && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold">Demandes ({requests.length})</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune demande.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/mes-demandes/${r.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateRange(r.start_at, r.end_at)}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
