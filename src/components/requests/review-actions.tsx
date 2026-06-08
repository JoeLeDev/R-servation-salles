"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { reviewReservationRequest } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ReviewActionsProps = {
  requestId: string;
};

export function ReviewActions({ requestId }: ReviewActionsProps) {
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  function handleReview(status: "approved" | "rejected") {
    startTransition(async () => {
      const result = await reviewReservationRequest(requestId, status, comment);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          status === "approved" ? "Demande approuvée." : "Demande refusée."
        );
        setComment("");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-2">
        <Label htmlFor={`comment-${requestId}`}>Commentaire (optionnel)</Label>
        <Textarea
          id={`comment-${requestId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Motif d'approbation ou de refus..."
          rows={2}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => handleReview("approved")}
        >
          Approuver
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => handleReview("rejected")}
        >
          Refuser
        </Button>
      </div>
    </div>
  );
}
