import { getExportStats, getServices } from "@/lib/data";
import { AdminExportPanel } from "@/components/admin/admin-export-panel";

export default async function AdminExportPage() {
  const month = new Date().toISOString().slice(0, 7);
  const [services, stats] = await Promise.all([
    getServices(),
    getExportStats(month),
  ]);

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Export & statistiques</h2>
      <AdminExportPanel
        services={services}
        initialStats={stats}
        initialMonth={month}
      />
    </section>
  );
}
