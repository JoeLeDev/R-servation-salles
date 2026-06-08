import Link from "next/link";
import { Building2, ClipboardList, LayoutGrid, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";

const navItems = [
  { href: "/salles", label: "Salles", icon: LayoutGrid },
  { href: "/mes-demandes", label: "Mes demandes", icon: ClipboardList },
  { href: "/validation", label: "Validation", icon: ShieldCheck, roles: ["service_manager", "admin"] as const },
];

export async function Header() {
  const supabase = await createClient();
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;
  const profile = user ? await getCurrentProfile() : null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Building2 className="size-5 text-primary" />
          <span>Réservation Cité</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            if (
              item.roles &&
              (!profile || !item.roles.includes(profile.role as "service_manager" | "admin"))
            ) {
              return null;
            }

            const Icon = item.icon;
            return (
              <Button key={item.href} variant="ghost" asChild>
                <Link href={item.href} className="gap-2">
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu email={user.email ?? ""} name={profile?.full_name} />
          ) : (
            <Button asChild>
              <Link href="/connexion">Se connecter</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
