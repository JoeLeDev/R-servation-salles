import Link from "next/link";
import { searchAll } from "@/lib/data";
import { formatDateRange } from "@/lib/format";
import { StatusBadge } from "@/components/requests/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function RecherchePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const { rooms, requests } = query ? await searchAll(query) : { rooms: [], requests: [] };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Recherche</h1>
      <p className="mt-1 mb-6 text-muted-foreground">
        Salles et demandes par mot-clé
      </p>

      <form className="flex gap-2" action="/recherche" method="get">
        <Input name="q" placeholder="Ex. Onyx, réunion..." defaultValue={query} />
        <Button type="submit">Rechercher</Button>
      </form>

      {query && (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="mb-3 font-semibold">Salles ({rooms.length})</h2>
            {rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune salle.</p>
            ) : (
              <ul className="space-y-2">
                {rooms.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/salles/${r.slug}`}
                      className="block rounded-lg border p-3 hover:bg-muted/50"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
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
        </div>
      )}
    </div>
  );
}
