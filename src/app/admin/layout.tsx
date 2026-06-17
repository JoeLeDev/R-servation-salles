import { redirect } from "next/navigation";
import { requireRole } from "@/lib/data";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["admin"]);
  if (!profile) redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="mt-1 text-muted-foreground">
            Gestion des utilisateurs, salles et règles
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/export/reservations" download>
            Exporter CSV
          </a>
        </Button>
      </div>

      <AdminNav />

      {children}
    </div>
  );
}
