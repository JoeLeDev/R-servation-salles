import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Rafraîchit la session uniquement sur les routes qui en ont besoin */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/mes-demandes/:path*",
    "/validation",
    "/admin/:path*",
    "/tableau-de-bord",
    "/connexion-test",
    "/salles/:slug",
    "/auth/callback",
  ],
};
