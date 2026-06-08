const PLACEHOLDER_HOSTS = ["votre-projet.supabase.co", "your-project.supabase.co"];

export function getSupabaseKey(): string | undefined {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (publishable && !publishable.startsWith("sb_secret_")) {
    return publishable;
  }

  if (anon && !anon.startsWith("sb_secret_")) {
    return anon;
  }

  return undefined;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseKey();

  if (!url || !key) return false;

  try {
    const hostname = new URL(url).hostname;
    if (PLACEHOLDER_HOSTS.includes(hostname)) return false;
  } catch {
    return false;
  }

  return true;
}
