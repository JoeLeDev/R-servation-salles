import { getAllProfiles, getServices } from "@/lib/data";
import { AdminCreateUserForm } from "@/components/admin/admin-create-user-form";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export default async function AdminUsersPage() {
  const [profiles, services] = await Promise.all([
    getAllProfiles(),
    getServices(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold">Créer un utilisateur</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crée un compte avec email et mot de passe. L&apos;utilisateur pourra se
          connecter immédiatement.
        </p>
        <div className="mt-4">
          <AdminCreateUserForm services={services} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Tous les utilisateurs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profiles.length} compte{profiles.length > 1 ? "s" : ""} enregistré
              {profiles.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <AdminUsersTable profiles={profiles} services={services} />
      </section>
    </div>
  );
}
