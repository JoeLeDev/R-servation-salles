"use server";

import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return { ok: true };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    full_name:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
  });

  if (error) {
    console.error("ensureProfile error:", error.message, error.code, error.details);
    return {
      ok: false,
      error:
        "Votre profil utilisateur n'a pas pu être créé. Contactez l'administrateur.",
    };
  }

  return { ok: true };
}
