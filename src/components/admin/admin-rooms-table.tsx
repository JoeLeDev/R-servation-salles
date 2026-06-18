"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Room } from "@/types/database";
import { updateRoomActive } from "@/lib/actions/requests";
import { AdminRoomEditDialog } from "@/components/admin/admin-room-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminRoomsTable({ rooms }: { rooms: Room[] }) {
  const [pending, startTransition] = useTransition();

  function toggle(room: Room) {
    startTransition(async () => {
      const result = await updateRoomActive(room.id, !room.is_active);
      if (result.error) toast.error(result.error);
      else toast.success(room.is_active ? "Salle désactivée." : "Salle activée.");
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left">Salle</th>
            <th className="p-3 text-left">Service</th>
            <th className="p-3 text-left">Statut</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="border-t">
              <td className="p-3 font-medium">{room.name}</td>
              <td className="p-3">{room.services?.name ?? "—"}</td>
              <td className="p-3">
                <Badge variant={room.is_active ? "default" : "secondary"}>
                  {room.is_active ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex justify-end gap-2">
                  <AdminRoomEditDialog room={room} />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => toggle(room)}
                  >
                    {room.is_active ? "Désactiver" : "Activer"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
