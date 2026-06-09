/**
 * URL publique du site (production Vercel ou local).
 * Côté client, on préfère window.location.origin.
 */
export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(next?: string): string {
  const base = `${getSiteUrl()}/auth/callback`;
  if (next && next.startsWith("/")) {
    return `${base}?next=${encodeURIComponent(next)}`;
  }
  return base;
}
