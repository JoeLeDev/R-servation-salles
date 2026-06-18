"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateRoomDetails } from "@/lib/actions/admin";
import type { RequestFormState } from "@/lib/actions/requests";
import type { Room } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: RequestFormState = {};

export function AdminRoomEditDialog({ room }: { room: Room }) {
  const [state, formAction, pending] = useActionState(updateRoomDetails, initialState);

  useEffect(() => {
    if (state.success) toast.success("Salle mise à jour.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier {room.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="room_id" value={room.id} />

          <div className="space-y-1.5">
            <Label htmlFor={`desc-${room.id}`}>Description</Label>
            <Textarea
              id={`desc-${room.id}`}
              name="description"
              rows={3}
              defaultValue={room.description ?? ""}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`surface-${room.id}`}>Surface (m²)</Label>
              <Input
                id={`surface-${room.id}`}
                name="surface_sqm"
                type="number"
                min={0}
                defaultValue={room.surface_sqm ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`capacity-${room.id}`}>Capacité</Label>
              <Input
                id={`capacity-${room.id}`}
                name="capacity"
                type="number"
                min={0}
                defaultValue={room.capacity ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`pricing-${room.id}`}>Type de tarif</Label>
              <select
                id={`pricing-${room.id}`}
                name="pricing_type"
                defaultValue={room.pricing_type}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="from">À partir de</option>
                <option value="quote">Sur devis</option>
                <option value="free">Gratuit</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`price-${room.id}`}>Prix de base (€)</Label>
              <Input
                id={`price-${room.id}`}
                name="base_price"
                type="number"
                min={0}
                defaultValue={room.base_price ?? ""}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`equipment-${room.id}`}>Équipements</Label>
            <Input
              id={`equipment-${room.id}`}
              name="equipment"
              defaultValue={room.equipment?.join(", ") ?? ""}
              placeholder="Séparés par des virgules"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`floor-${room.id}`}>Étage</Label>
              <Input
                id={`floor-${room.id}`}
                name="floor_label"
                defaultValue={room.floor_label ?? ""}
                placeholder="RDC, R+1…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`zone-${room.id}`}>Zone plan</Label>
              <Input
                id={`zone-${room.id}`}
                name="plan_zone"
                defaultValue={room.plan_zone ?? ""}
              />
            </div>
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
