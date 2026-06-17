"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addRequestComment } from "@/lib/actions/requests";
import type { RequestComment } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RequestComments({
  requestId,
  comments,
}: {
  requestId: string;
  comments: RequestComment[];
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addRequestComment(requestId, body);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Commentaire ajouté.");
        setBody("");
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Commentaires</h3>
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun commentaire.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">
                {c.profiles?.full_name ?? c.profiles?.email ?? "Utilisateur"}
              </p>
              <p className="mt-1">{c.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={2}
        />
        <Button type="submit" size="sm" disabled={pending}>
          Publier
        </Button>
      </form>
    </div>
  );
}
