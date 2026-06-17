"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { createRoomBlackout, deleteRoomBlackout } from "@/lib/actions/admin";
import type { RequestFormState } from "@/lib/actions/requests";
import type { Room, RoomBlackout } from "@/types/database";
import { formatDateRange } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AdminBlackoutsPanel({
  rooms,
  blackouts,
}: {
  rooms: Room[];
  blackouts: RoomBlackout[];
}) {
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [recurring, setRecurring] = useState(false);
  const [state, formAction, pending] = useActionState(createRoomBlackout, {} as RequestFormState);
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.success) toast.success("Période bloquée créée.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={formAction} className="space-y-4 rounded-xl border p-6">
        <h3 className="font-semibold">Nouvelle période bloquée</h3>
        <input type="hidden" name="room_id" value={roomId} />
        <div className="space-y-2">
          <Label>Salle</Label>
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bo-title">Titre</Label>
          <Input id="bo-title" name="title" required placeholder="Maintenance" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bo-reason">Motif</Label>
          <Textarea id="bo-reason" name="reason" rows={2} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bo-start">Début</Label>
            <Input id="bo-start" name="start_at" type="datetime-local" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bo-end">Fin</Label>
            <Input id="bo-end" name="end_at" type="datetime-local" required />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
          Répéter chaque semaine
        </label>
        {recurring && (
          <div className="space-y-2">
            <Label htmlFor="bo-until">Jusqu&apos;au</Label>
            <Input id="bo-until" name="recurrence_until" type="date" />
          </div>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Création..." : "Bloquer la période"}
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold">Périodes actives</h3>
        {blackouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune période bloquée.</p>
        ) : (
          blackouts.map((b) => (
            <div key={b.id} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-muted-foreground">
                  {b.rooms?.name} · {formatDateRange(b.start_at, b.end_at)}
                </p>
                {b.recurrence_frequency === "weekly" && (
                  <p className="text-xs text-muted-foreground">Répétition hebdomadaire</p>
                )}
                {b.reason && <p className="mt-1">{b.reason}</p>}
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={deleting}
                onClick={() =>
                  startDelete(async () => {
                    const r = await deleteRoomBlackout(b.id);
                    if (r.error) toast.error(r.error);
                    else toast.success("Supprimé.");
                  })
                }
              >
                Supprimer
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
