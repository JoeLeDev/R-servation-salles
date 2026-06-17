import type { SupabaseClient } from "@supabase/supabase-js";

export type ChangeLogAction = "created" | "updated" | "cancelled";

export async function logRequestChange(
  supabase: SupabaseClient,
  params: {
    requestId: string;
    actorId: string;
    action: ChangeLogAction;
    changes?: Record<string, { old: unknown; new: unknown }>;
    reason?: string | null;
  }
) {
  const { error } = await supabase.from("request_change_log").insert({
    request_id: params.requestId,
    actor_id: params.actorId,
    action: params.action,
    changes: params.changes ?? {},
    reason: params.reason ?? null,
  });

  if (error) {
    console.warn("logRequestChange:", error.message);
  }
}
