import { createClient } from "@/lib/supabase/server";

/** Rafraîchit la session Supabase côté serveur (remplace le middleware edge) */
export async function SessionRefresh() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.getUser();
  }
  return null;
}
