"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  cancelReservationRequest,
  updateReservationRequest,
  type RequestFormState,
} from "@/lib/actions/requests";
import type { ReservationRequest } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RequestEditForm({ request }: { request: ReservationRequest }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateReservationRequest,
    {} as RequestFormState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Demande mise à jour.");
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-4">
      <h3 className="font-medium">Modifier la demande</h3>
      <input type="hidden" name="request_id" value={request.id} />
      <div className="space-y-2">
        <Label htmlFor="edit-title">Titre</Label>
        <Input id="edit-title" name="title" defaultValue={request.title} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-start">Début</Label>
          <Input
            id="edit-start"
            name="start_at"
            type="datetime-local"
            defaultValue={toLocalInput(request.start_at)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-end">Fin</Label>
          <Input
            id="edit-end"
            name="end_at"
            type="datetime-local"
            defaultValue={toLocalInput(request.end_at)}
            required
          />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}

export function RequestCancelForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    cancelReservationRequest,
    {} as RequestFormState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Demande annulée.");
      router.push("/mes-demandes");
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-destructive/30 p-4">
      <h3 className="font-medium text-destructive">Annuler la demande</h3>
      <input type="hidden" name="request_id" value={requestId} />
      <div className="space-y-2">
        <Label htmlFor="cancel-reason">Motif d&apos;annulation *</Label>
        <Textarea
          id="cancel-reason"
          name="reason"
          rows={3}
          required
          placeholder="Expliquez pourquoi vous annulez cette demande..."
        />
      </div>
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? "Annulation..." : "Confirmer l'annulation"}
      </Button>
    </form>
  );
}
