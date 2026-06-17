"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  importUsersFromCsv,
  resetUserPassword,
  setUserActive,
  updateUserRole,
} from "@/lib/actions/admin";
import type { Profile, UserRole } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminUsersTableProps = {
  profiles: Profile[];
  services: { id: string; name: string }[];
};

function UserRow({
  profile,
  services,
}: {
  profile: Profile;
  services: { id: string; name: string }[];
}) {
  const [role, setRole] = useState<UserRole>(profile.role);
  const [serviceId, setServiceId] = useState(profile.service_id ?? "none");
  const [newPassword, setNewPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const inactive = profile.is_active === false;

  function handleSave() {
    startTransition(async () => {
      const result = await updateUserRole(
        profile.id,
        role,
        serviceId === "none" ? null : serviceId
      );
      if (result.error) toast.error(result.error);
      else toast.success("Profil mis à jour.");
    });
  }

  function handleResetPassword() {
    if (newPassword.length < 8) {
      toast.error("Mot de passe : 8 caractères minimum.");
      return;
    }
    startTransition(async () => {
      const result = await resetUserPassword(profile.id, newPassword);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Mot de passe réinitialisé.");
        setNewPassword("");
      }
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      const result = await setUserActive(profile.id, inactive);
      if (result.error) toast.error(result.error);
      else toast.success(inactive ? "Compte réactivé." : "Compte désactivé.");
    });
  }

  return (
    <tr className={`border-t ${inactive ? "opacity-60" : ""}`}>
      <td className="p-3">
        {profile.email}
        {inactive && (
          <Badge variant="outline" className="ml-2">
            Désactivé
          </Badge>
        )}
      </td>
      <td className="p-3">{profile.full_name ?? "—"}</td>
      <td className="p-3">
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employé</SelectItem>
            <SelectItem value="service_manager">Responsable</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">—</SelectItem>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-2">
          <Button size="sm" disabled={pending} onClick={handleSave}>
            Enregistrer
          </Button>
          <div className="flex gap-1">
            <Input
              type="password"
              placeholder="Nouveau MDP"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={handleResetPassword}
            >
              MDP
            </Button>
          </div>
          <Button
            size="sm"
            variant={inactive ? "secondary" : "destructive"}
            disabled={pending}
            onClick={handleToggleActive}
          >
            {inactive ? "Réactiver" : "Désactiver"}
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function AdminUsersTable({ profiles, services }: AdminUsersTableProps) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.email.toLowerCase().includes(q) ||
        (p.full_name?.toLowerCase().includes(q) ?? false);
      const matchesRole = roleFilter === "all" || p.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [profiles, query, roleFilter]);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("csv", file);
    startTransition(async () => {
      const result = await importUsersFromCsv({}, fd);
      if (result.error && !result.success) toast.error(result.error);
      else if (result.error) toast.warning(result.error);
      else toast.success("Import terminé.");
    });
    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher email ou nom..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="employee">Employés</SelectItem>
            <SelectItem value="service_manager">Responsables</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <label className="inline-flex cursor-pointer items-center">
          <Button variant="outline" size="sm" disabled={pending} asChild>
            <span>Importer CSV</span>
          </Button>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        CSV : email, nom, rôle (optionnel), mot de passe temporaire (optionnel)
      </p>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Rôle</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <UserRow key={p.id} profile={p} services={services} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
