import Link from "next/link";
import {
  Building2,
  Calendar,
  ClipboardList,
  LayoutGrid,
  Map,
  Search,
  Settings,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";

const navItems = [
  { href: "/salles", label: "Salles", icon: LayoutGrid },
  { href: "/calendrier", label: "Calendrier", icon: Calendar },
  { href: "/plan", label: "Plan", icon: Map },
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard, auth: true },
  { href: "/mes-demandes", label: "Mes demandes", icon: ClipboardList, auth: true },
  { href: "/validation", label: "Validation", icon: ShieldCheck, roles: ["service_manager", "admin"] as const },
  { href: "/admin", label: "Admin", icon: Settings, roles: ["admin"] as const },
];

export async function Header() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const profile = user ? await getCurrentProfile() : null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <Building2 className="size-5 text-primary" />
          <span className="hidden sm:inline">Réservation Cité</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            if (item.auth && !user) return null;
            if (
              item.roles &&
              (!profile || !item.roles.includes(profile.role as (typeof item.roles)[number]))
            ) {
              return null;
            }
            const Icon = item.icon;
            return (
              <Button key={item.href} variant="ghost" size="sm" asChild>
                <Link href={item.href} className="gap-1.5">
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link href="/recherche" aria-label="Rechercher">
              <Search className="size-4" />
            </Link>
          </Button>
          <ThemeToggle />
          {user ? (
            <UserMenu email={user.email ?? ""} name={profile?.full_name} />
          ) : (
            <Button asChild size="sm">
              <Link href="/connexion">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
