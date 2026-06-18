"use client";

import Link from "next/link";
import { useState } from "react";
import type { Room } from "@/types/database";
import { RequestForm } from "@/components/requests/request-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RoomReservationPanelProps = {
  room: Room;
  isLoggedIn: boolean;
  loginHref: string;
  defaultStart?: string;
  defaultEnd?: string;
};

function ReservationIntro({ serviceName }: { serviceName?: string }) {
  return (
    <>
      <CardTitle className="text-lg">Demande de réservation</CardTitle>
      <CardDescription className="text-xs">
        Transmise au service {serviceName} pour validation.
      </CardDescription>
    </>
  );
}

export function RoomReservationPanel({
  room,
  isLoggedIn,
  loginHref,
  defaultStart,
  defaultEnd,
}: RoomReservationPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <Card className="order-1 lg:sticky lg:top-20 lg:col-span-5 lg:order-2">
        <CardHeader className="pb-3">
          <ReservationIntro serviceName={room.services?.name} />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Consultez librement la fiche. Connectez-vous pour envoyer une demande
            de réservation.
          </p>
          <Button asChild className="w-full">
            <Link href={loginHref}>Se connecter pour réserver</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const form = (
    <RequestForm
      room={room}
      compact
      defaultStart={defaultStart}
      defaultEnd={defaultEnd}
    />
  );

  return (
    <>
      <Card className="order-1 hidden lg:sticky lg:top-20 lg:col-span-5 lg:order-2 lg:block">
        <CardHeader className="pb-3">
          <ReservationIntro serviceName={room.services?.name} />
        </CardHeader>
        <CardContent>{form}</CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
        <Button className="w-full" onClick={() => setMobileOpen(true)}>
          Réserver cette salle
        </Button>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demande de réservation</DialogTitle>
            <DialogDescription>
              {room.name} — service {room.services?.name}
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    </>
  );
}
