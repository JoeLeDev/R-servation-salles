import { getAllRoomsAdmin, getRoomBlackouts } from "@/lib/data";
import { AdminBlackoutsPanel } from "@/components/admin/admin-blackouts-panel";

export default async function AdminBlackoutsPage() {
  const [rooms, blackouts] = await Promise.all([
    getAllRoomsAdmin(),
    getRoomBlackouts(),
  ]);

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Périodes bloquées</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Fermetures, maintenance et événements récurrents par salle.
      </p>
      <AdminBlackoutsPanel rooms={rooms} blackouts={blackouts} />
    </section>
  );
}
