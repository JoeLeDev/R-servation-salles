"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Profile, UserRole } from "@/types/database";
import { updateUserRole } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
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
  const [pending, startTransition] = useTransition();

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

  return (
    <tr className="border-t">
      <td className="p-3">{profile.email}</td>
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
        <Button size="sm" disabled={pending} onClick={handleSave}>
          Enregistrer
        </Button>
      </td>
    </tr>
  );
}

export function AdminUsersTable({ profiles, services }: AdminUsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Nom</th>
            <th className="p-3 text-left">Rôle</th>
            <th className="p-3 text-left">Service</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <UserRow key={p.id} profile={p} services={services} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
