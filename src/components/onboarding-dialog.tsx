"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "reservation-cite-onboarding-done";

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bienvenue sur Réservation Cité</DialogTitle>
          <DialogDescription>
            Réservez une salle en 3 étapes simples.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
          <li>Parcourez le catalogue ou le calendrier des disponibilités</li>
          <li>Soumettez une demande avec date, horaire et détails</li>
          <li>Le service concerné valide ou refuse votre demande</li>
        </ol>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleClose}>
            Compris
          </Button>
          <Button asChild onClick={handleClose}>
            <Link href="/salles">Voir les salles</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
