"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createAdminUser } from "@/lib/actions/admin";
import type { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminCreateUserFormProps = {
  services: { id: string; name: string }[];
};

export function AdminCreateUserForm({ services }: AdminCreateUserFormProps) {
  const [role, setRole] = useState<UserRole>("employee");
  const [serviceId, setServiceId] = useState("none");
  const [state, formAction, pending] = useActionState(createAdminUser, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Utilisateur créé avec succès.");
  }, [state]);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Nouveau compte</CardTitle>
        <CardDescription>
          Nécessite la clé service_role côté serveur (variable d&apos;environnement).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="prenom.nom@cite.fr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe temporaire</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="8 caractères minimum"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Prénom Nom"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employé</SelectItem>
                  <SelectItem value="service_manager">Responsable de service</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={role} />
            </div>

            <div className="space-y-2">
              <Label>Service</Label>
              <Select
                value={serviceId}
                onValueChange={setServiceId}
                disabled={role !== "service_manager"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
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
              <input
                type="hidden"
                name="service_id"
                value={role === "service_manager" ? serviceId : "none"}
              />
            </div>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Création..." : "Créer l'utilisateur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
