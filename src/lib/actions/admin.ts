"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getEmailDomainSettings } from "@/lib/data";
import { emailDomainError, isEmailDomainAllowed } from "@/lib/email-domain";
import type { RequestFormState } from "@/lib/actions/requests";
import type { EmailDomainSettings, UserRole } from "@/types/database";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Réservé aux administrateurs." };
  }
  return { ok: true as const, profile };
}

export async function createAdminUser(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const fullName = (formData.get("full_name") as string)?.trim() || null;
  const role = formData.get("role") as UserRole;
  const serviceIdRaw = formData.get("service_id") as string;
  const serviceId = serviceIdRaw === "none" ? null : serviceIdRaw;

  if (!email || !password) {
    return { error: "Email et mot de passe sont obligatoires." };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  if (!["employee", "service_manager", "admin"].includes(role)) {
    return { error: "Rôle invalide." };
  }

  if (role === "service_manager" && !serviceId) {
    return { error: "Un responsable de service doit être rattaché à un service." };
  }

  const domainSettings = await getEmailDomainSettings();
  if (!isEmailDomainAllowed(email, domainSettings)) {
    return { error: emailDomainError(domainSettings) };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Création impossible : ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local (Dashboard → Settings → API → service_role).",
    };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  });

  if (createError) {
    if (createError.message.includes("already been registered")) {
      return { error: "Un compte existe déjà avec cet email." };
    }
    return { error: createError.message };
  }

  if (!created.user) {
    return { error: "Création du compte échouée." };
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name: fullName,
    role,
    service_id: role === "service_manager" ? serviceId : null,
  });

  if (profileError) {
    return { error: "Compte créé mais profil non enregistré. Vérifiez la base." };
  }

  revalidatePath("/admin/utilisateurs");
  return { success: true };
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
  serviceId: string | null
): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  if (role === "service_manager" && !serviceId) {
    return { error: "Un responsable doit être rattaché à un service." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      service_id: role === "service_manager" ? serviceId : null,
    })
    .eq("id", userId);

  if (error) return { error: "Mise à jour impossible." };

  revalidatePath("/admin/utilisateurs");
  return { success: true };
}

export async function resetUserPassword(
  userId: string,
  password: string
): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const admin = createAdminClient();
  if (!admin) return { error: "Clé service_role manquante." };

  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { error: error.message };

  return { success: true };
}

export async function setUserActive(
  userId: string,
  isActive: boolean
): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { error: "Clé service_role manquante." };

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (profileError && !profileError.message.includes("is_active")) {
    return { error: "Mise à jour du profil impossible." };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? "none" : "876000h",
  });

  if (authError) return { error: authError.message };

  revalidatePath("/admin/utilisateurs");
  return { success: true };
}

export async function importUsersFromCsv(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const file = formData.get("csv") as File | null;
  if (!file || file.size === 0) return { error: "Fichier CSV manquant." };

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 1) return { error: "CSV vide." };

  const admin = createAdminClient();
  if (!admin) return { error: "Clé service_role manquante." };

  const domainSettings = await getEmailDomainSettings();
  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("email");
  const rows = hasHeader ? lines.slice(1) : lines;

  let created = 0;
  const errors: string[] = [];

  for (const line of rows) {
    const cols = line.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = (cols[0] ?? "").toLowerCase();
    const fullName = cols[1] || null;
    const role = (cols[2] as UserRole) || "employee";
    const tempPassword = cols[3] || `Temp${Math.random().toString(36).slice(2, 10)}!`;

    if (!email) continue;
    if (!isEmailDomainAllowed(email, domainSettings)) {
      errors.push(`${email}: domaine non autorisé`);
      continue;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });

    if (error) {
      errors.push(`${email}: ${error.message}`);
      continue;
    }

    if (data.user) {
      await admin.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: ["employee", "service_manager", "admin"].includes(role)
          ? role
          : "employee",
      });
      created++;
    }
  }

  revalidatePath("/admin/utilisateurs");

  if (errors.length && !created) {
    return { error: errors.slice(0, 3).join(" · ") };
  }

  return {
    success: true,
    error: errors.length ? `${created} créé(s), ${errors.length} erreur(s).` : undefined,
  };
}

export async function updateEmailDomains(
  settings: EmailDomainSettings
): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const domains = settings.domains
    .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);

  const { error } = await supabase.from("app_settings").upsert({
    key: "email_domains",
    value: { domains },
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: "Sauvegarde impossible." };

  revalidatePath("/admin/regles");
  return { success: true };
}

export async function createRoomBlackout(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const roomId = formData.get("room_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const reason = (formData.get("reason") as string)?.trim() || null;
  const startAt = formData.get("start_at") as string;
  const endAt = formData.get("end_at") as string;
  const recurring = formData.get("recurring") === "on";
  const recurrenceUntil = (formData.get("recurrence_until") as string) || null;

  if (!roomId || !title || !startAt || !endAt) {
    return { error: "Champs obligatoires manquants." };
  }

  const { error } = await supabase.from("room_blackouts").insert({
    room_id: roomId,
    title,
    reason,
    start_at: new Date(startAt).toISOString(),
    end_at: new Date(endAt).toISOString(),
    recurrence_frequency: recurring ? "weekly" : "none",
    recurrence_until:
      recurring && recurrenceUntil ? new Date(recurrenceUntil).toISOString() : null,
    created_by: auth.profile.id,
  });

  if (error) {
    if (error.message.includes("room_blackouts")) {
      return { error: "Exécutez la migration 20250610120000_extended_features.sql." };
    }
    return { error: "Création impossible." };
  }

  revalidatePath("/admin/blocages");
  revalidatePath("/salles");
  return { success: true };
}

export async function deleteRoomBlackout(blackoutId: string): Promise<RequestFormState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const { error } = await supabase.from("room_blackouts").delete().eq("id", blackoutId);
  if (error) return { error: "Suppression impossible." };

  revalidatePath("/admin/blocages");
  return { success: true };
}
