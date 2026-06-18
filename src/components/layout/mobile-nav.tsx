"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  Map,
  Menu,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { filterNavItems, navItems } from "@/lib/nav-items";
import type { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const iconByHref: Record<string, typeof LayoutGrid> = {
  "/salles": LayoutGrid,
  "/calendrier": Calendar,
  "/plan": Map,
  "/tableau-de-bord": LayoutDashboard,
  "/mes-demandes": ClipboardList,
  "/validation": ShieldCheck,
  "/admin": Settings,
  "/recherche": Search,
};

type MobileNavProps = {
  isLoggedIn: boolean;
  role: UserRole | null;
};

export function MobileNav({ isLoggedIn, role }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const visibleNavItems = filterNavItems(navItems, { isLoggedIn, role });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
          <Menu className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="fixed inset-y-0 right-0 left-auto top-0 h-full w-[min(100%,18rem)] max-w-none translate-x-0 translate-y-0 rounded-none border-l p-0 data-open:slide-in-from-right data-closed:slide-out-to-right"
      >
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle>Menu</DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col gap-1 p-2">
          {visibleNavItems.map((item) => {
            const Icon = iconByHref[item.href] ?? LayoutGrid;
            return (
              <Button
                key={item.href}
                variant="ghost"
                className="h-11 w-full justify-start gap-3 px-3"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href={item.href}>
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            className="h-11 w-full justify-start gap-3 px-3 sm:hidden"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/recherche">
              <Search className="size-4 shrink-0" />
              Rechercher
            </Link>
          </Button>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
