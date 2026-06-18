import type { UserRole } from "@/types/database";

export type NavItemConfig = {
  href: string;
  label: string;
  auth?: boolean;
  roles?: readonly UserRole[];
};

export const navItems: NavItemConfig[] = [
  { href: "/salles", label: "Salles" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/plan", label: "Plan" },
  { href: "/tableau-de-bord", label: "Tableau de bord", auth: true },
  { href: "/mes-demandes", label: "Mes demandes", auth: true },
  { href: "/validation", label: "Validation", roles: ["service_manager", "admin"] },
  { href: "/admin", label: "Admin", roles: ["admin"] },
];

export function filterNavItems(
  items: NavItemConfig[],
  options: { isLoggedIn: boolean; role: UserRole | null }
): NavItemConfig[] {
  return items.filter((item) => {
    if (item.auth && !options.isLoggedIn) return false;
    if (item.roles && (!options.role || !item.roles.includes(options.role))) {
      return false;
    }
    return true;
  });
}
