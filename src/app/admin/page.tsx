import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getAllProfiles,
  getAllRoomsAdmin,
  getBookingRules,
  getServices,
  requireRole,
} from "@/lib/data";
import { AdminRoomsTable } from "@/components/admin/admin-rooms-table";
import { AdminRulesForm } from "@/components/admin/admin-rules-form";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminPage() {
  const profile = await requireRole(["admin"]);
  if (!profile) redirect("/");

  const [profiles, rooms, services, rules] = await Promise.all([
    getAllProfiles(),
    getAllRoomsAdmin(),
    getServices(),
    getBookingRules(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="mt-1 text-muted-foreground">
            Utilisateurs, salles, règles et export
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/export/reservations" download>
            Exporter CSV
          </a>
        </Button>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="rooms">Salles</TabsTrigger>
          <TabsTrigger value="rules">Règles métier</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <AdminUsersTable profiles={profiles} services={services} />
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <AdminRoomsTable rooms={rooms} />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <AdminRulesForm rules={rules} />
        </TabsContent>
      </Tabs>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/tableau-de-bord">← Tableau de bord</Link>
      </p>
    </div>
  );
}
