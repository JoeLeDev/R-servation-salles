"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { uploadRequestAttachment } from "@/lib/actions/requests";
import type { RequestAttachment } from "@/types/database";
import { Button } from "@/components/ui/button";

export function RequestAttachments({
  requestId,
  attachments,
}: {
  requestId: string;
  attachments: RequestAttachment[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await uploadRequestAttachment(requestId, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Fichier ajouté.");
        inputRef.current!.value = "";
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Pièces jointes</h3>
      {attachments.length > 0 && (
        <ul className="space-y-2 text-sm">
          {attachments.map((a) => (
            <li key={a.id} className="rounded border px-3 py-2">
              {a.file_name}
              {a.size_bytes && (
                <span className="ml-2 text-muted-foreground">
                  ({Math.round(a.size_bytes / 1024)} Ko)
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          Joindre
        </Button>
      </form>
    </div>
  );
}
