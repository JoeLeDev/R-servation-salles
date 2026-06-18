import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ClipboardList,
  LayoutGrid,
  Map,
  Search,
  Settings,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import icon from "@/app/icon.png";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data";
import { filterNavItems, navItems } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

const navIcons = {
  "/salles": LayoutGrid,
  "/calendrier": Calendar,
  "/plan": Map,
  "/tableau-de-bord": LayoutDashboard,
  "/mes-demandes": ClipboardList,
  "/validation": ShieldCheck,
  "/admin": Settings,
} as const;

export async function Header() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const profile = user ? await getCurrentProfile() : null;

  const visibleNavItems = filterNavItems(navItems, {
    isLoggedIn: Boolean(user),
    role: profile?.role ?? null,
  });

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <Image src={icon} alt="Réservation Cité" width={32} height={32} />
          <span className="hidden sm:inline">Réservation Cité</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {visibleNavItems.map((item) => {
            const Icon = navIcons[item.href as keyof typeof navIcons] ?? LayoutGrid;
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
          <MobileNav
            isLoggedIn={Boolean(user)}
            role={profile?.role ?? null}
          />
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
