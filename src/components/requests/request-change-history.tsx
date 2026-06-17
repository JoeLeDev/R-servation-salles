import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { RequestChangeLog } from "@/types/database";

const actionLabels: Record<RequestChangeLog["action"], string> = {
  created: "Création",
  updated: "Modification",
  cancelled: "Annulation",
};

export function RequestChangeHistory({ logs }: { logs: RequestChangeLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucun historique pour cette demande.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{actionLabels[log.action]}</span>
            <time className="text-xs text-muted-foreground">
              {format(new Date(log.created_at), "d MMM yyyy HH:mm", { locale: fr })}
            </time>
          </div>
          <p className="mt-1 text-muted-foreground">
            Par {log.profiles?.full_name ?? log.profiles?.email ?? "Utilisateur"}
          </p>
          {log.reason && (
            <p className="mt-1">
              <span className="font-medium">Motif :</span> {log.reason}
            </p>
          )}
          {Object.keys(log.changes ?? {}).length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {Object.entries(log.changes).map(([field, change]) => (
                <li key={field}>
                  <span className="font-medium">{field}</span> :{" "}
                  {String(change.old)} → {String(change.new)}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
