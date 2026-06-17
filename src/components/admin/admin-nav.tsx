"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/salles", label: "Salles" },
  { href: "/admin/blocages", label: "Blocages" },
  { href: "/admin/regles", label: "Règles métier" },
  { href: "/admin/export", label: "Export" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b pb-4">
      {adminLinks.map((link) => (
        <Button
          key={link.href}
          variant={pathname === link.href ? "secondary" : "ghost"}
          size="sm"
          asChild
        >
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}
    </nav>
  );
}
