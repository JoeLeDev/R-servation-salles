"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  createReservationRequest,
  type RequestFormState,
} from "@/lib/actions/requests";
import type { Room } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: RequestFormState = {};

type RequestFormProps = {
  room: Room;
};

export function RequestForm({ room }: RequestFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createReservationRequest,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Demande envoyée au service concerné.");
      router.push("/mes-demandes");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="room_id" value={room.id} />

      <div className="space-y-2">
        <Label htmlFor="title">Titre de l&apos;événement *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ex. Réunion équipe marketing"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_at">Début *</Label>
          <Input id="start_at" name="start_at" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_at">Fin *</Label>
          <Input id="end_at" name="end_at" type="datetime-local" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendees">Nombre de participants</Label>
        <Input
          id="attendees"
          name="attendees"
          type="number"
          min={1}
          max={room.capacity ?? undefined}
          placeholder={room.capacity ? `Max. ${room.capacity}` : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description / besoins</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Précisez l'usage, le matériel nécessaire, etc."
        />
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Votre demande sera transmise au service{" "}
        <strong className="text-foreground">{room.services?.name}</strong> pour
        validation.
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi en cours..." : "Envoyer la demande"}
      </Button>
    </form>
  );
}
