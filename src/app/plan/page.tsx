import Link from "next/link";
import { getRooms } from "@/lib/data";
import { BuildingPlan } from "@/components/plan/building-plan";
import { Button } from "@/components/ui/button";

export default async function PlanPage() {
  const rooms = await getRooms();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Plan des salles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Naviguez par bâtiment et par étage. Les salles réservables sont
          cliquables.
        </p>
      </div>

      <BuildingPlan
        rooms={rooms.map((r) => ({
          slug: r.slug,
          name: r.name,
          is_active: r.is_active,
        }))}
      />

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/salles">Catalogue des salles</Link>
        </Button>
      </div>
    </div>
  );
}
