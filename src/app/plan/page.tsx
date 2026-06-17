import Link from "next/link";
import { getRooms } from "@/lib/data";
import { Button } from "@/components/ui/button";

const ZONES = [
  { id: "auditorium", label: "Auditorium", color: "#1e3a5f", x: 10, y: 10, w: 35, h: 25 },
  { id: "polyvalente-ouest", label: "Polyvalentes Ouest", color: "#2563eb", x: 50, y: 10, w: 40, h: 30 },
  { id: "polyvalente-est", label: "Polyvalentes Est", color: "#3b82f6", x: 50, y: 45, w: 40, h: 25 },
  { id: "salons", label: "Salons", color: "#7c3aed", x: 10, y: 40, w: 35, h: 20 },
  { id: "studios", label: "Studios TV", color: "#dc2626", x: 10, y: 65, w: 35, h: 25 },
  { id: "enfants", label: "Espaces enfants", color: "#16a34a", x: 50, y: 75, w: 40, h: 20 },
];

export default async function PlanPage() {
  const rooms = await getRooms();
  const byZone = new Map<string, typeof rooms>();

  for (const room of rooms) {
    const zone = room.plan_zone ?? "autre";
    if (!byZone.has(zone)) byZone.set(zone, []);
    byZone.get(zone)!.push(room);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Plan des salles</h1>
        <p className="mt-1 text-muted-foreground">
          Vue simplifiée — le plan détaillé sera ajouté avec vos photos
        </p>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <svg viewBox="0 0 100 100" className="w-full max-h-[480px]">
          {ZONES.map((z) => (
            <g key={z.id}>
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                rx={2}
                fill={z.color}
                fillOpacity={0.15}
                stroke={z.color}
                strokeWidth={0.5}
              />
              <text
                x={z.x + z.w / 2}
                y={z.y + 4}
                textAnchor="middle"
                fontSize={3}
                fill="currentColor"
                className="font-medium"
              >
                {z.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {[...byZone.entries()].map(([zone, zoneRooms]) => (
          <div key={zone} className="rounded-xl border p-4">
            <h2 className="mb-3 font-semibold capitalize">{zone.replace(/-/g, " ")}</h2>
            <ul className="space-y-2">
              {zoneRooms.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/salles/${r.slug}`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {r.name}
                    {r.floor_label && (
                      <span className="text-muted-foreground"> ({r.floor_label})</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/salles">Voir le catalogue</Link>
        </Button>
      </div>
    </div>
  );
}
