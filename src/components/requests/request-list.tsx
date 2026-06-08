"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ReservationRequest } from "@/types/database";
import { formatDateRange } from "@/lib/format";
import { cancelReservationRequest } from "@/lib/actions/requests";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RequestListProps = {
  requests: ReservationRequest[];
  showRequester?: boolean;
};

export function RequestList({ requests, showRequester = false }: RequestListProps) {
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Aucune demande pour le moment.
      </div>
    );
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await cancelReservationRequest(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Demande annulée.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{request.title}</CardTitle>
              <CardDescription className="mt-1">
                {request.rooms?.name} · {formatDateRange(request.start_at, request.end_at)}
              </CardDescription>
              {showRequester && request.profiles && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Demandeur : {request.profiles.full_name ?? request.profiles.email}
                </p>
              )}
            </div>
            <StatusBadge status={request.status} />
          </CardHeader>
          <CardContent className="space-y-3">
            {request.description && (
              <p className="text-sm text-muted-foreground">{request.description}</p>
            )}
            {request.review_comment && (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="font-medium">Réponse du service : </span>
                {request.review_comment}
              </p>
            )}
            {!showRequester && request.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => handleCancel(request.id)}
              >
                Annuler la demande
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
