import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getDashboardStats,
  getMyRequests,
  getPendingRequestsForReview,
} from "@/lib/data";
import { formatDateRange } from "@/lib/format";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?redirect=/tableau-de-bord");

  const [stats, myRequests, pending] = await Promise.all([
    getDashboardStats(),
    getMyRequests(),
    profile.role !== "employee" ? getPendingRequestsForReview() : Promise.resolve([]),
  ]);

  const upcoming = myRequests
    .filter((r) => r.status === "approved" && new Date(r.start_at) > new Date())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="mt-1 text-muted-foreground">
            Bonjour {profile.full_name ?? profile.email}
          </p>
        </div>
        <Button asChild>
          <Link href="/salles">Nouvelle demande</Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Salles actives" value={stats.totalRooms} />
        <StatCard title="Demandes en attente" value={stats.pendingRequests} />
        <StatCard title="Approuvées ce mois" value={stats.approvedThisMonth} />
        <StatCard title="Mes demandes" value={myRequests.length} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prochaines réservations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune à venir.</p>
            ) : (
              upcoming.map((r) => (
                <Link
                  key={r.id}
                  href={`/mes-demandes/${r.id}`}
                  className="block rounded-lg border p-3 text-sm hover:bg-muted/50"
                >
                  <div className="font-medium">{r.title}</div>
                  <div className="text-muted-foreground">
                    {r.rooms?.name} · {formatDateRange(r.start_at, r.end_at)}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {pending.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">À valider</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/validation">Tout voir</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.slice(0, 5).map((r) => (
                <div key={r.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{r.title}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-muted-foreground">
                    {r.rooms?.name} · {formatDateRange(r.start_at, r.end_at)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {stats.topRooms.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Salles les plus réservées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {stats.topRooms.map((r) => (
                  <div key={r.name} className="rounded-lg border px-4 py-2 text-sm">
                    <span className="font-medium">{r.name}</span>
                    <span className="ml-2 text-muted-foreground">{r.count} rés.</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
