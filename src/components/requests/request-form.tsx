"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  compact?: boolean;
};

export function RequestForm({ room, compact = false }: RequestFormProps) {
  const router = useRouter();
  const [recurring, setRecurring] = useState(false);
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
    <form action={formAction} className={compact ? "space-y-3" : "space-y-4"}>
      <input type="hidden" name="room_id" value={room.id} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Titre de l&apos;événement *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ex. Réunion équipe marketing"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="start_at">Début *</Label>
          <Input id="start_at" name="start_at" type="datetime-local" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_at">Fin *</Label>
          <Input id="end_at" name="end_at" type="datetime-local" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="attendees">Participants</Label>
          <Input
            id="attendees"
            name="attendees"
            type="number"
            min={1}
            max={room.capacity ?? undefined}
            placeholder={room.capacity ? `Max. ${room.capacity}` : undefined}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description / besoins</Label>
        <Textarea
          id="description"
          name="description"
          rows={compact ? 2 : 3}
          placeholder="Usage, matériel nécessaire…"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="recurring"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="size-4 rounded border"
        />
        Réservation récurrente
      </label>

      {recurring && (
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="recurrence_frequency">Fréquence</Label>
            <select
              id="recurrence_frequency"
              name="recurrence_frequency"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              defaultValue="weekly"
            >
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recurrence_count">Occurrences</Label>
            <Input
              id="recurrence_count"
              name="recurrence_count"
              type="number"
              min={2}
              max={12}
              defaultValue={4}
            />
          </div>
        </div>
      )}

      {room.requires_second_approval && (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          Validation en 2 étapes (service puis direction).
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi en cours…" : "Envoyer la demande"}
      </Button>
    </form>
  );
}
