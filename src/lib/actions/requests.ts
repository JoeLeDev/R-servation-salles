"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/actions/ensure-profile";
import {
  addRecurrenceDates,
  validateBookingDates,
  DEFAULT_BOOKING_RULES,
} from "@/lib/booking-rules";
import {
  checkBlackoutConflict,
  checkBookingConflict,
  getBookingRules,
  getCurrentProfile,
  getRequestById,
  getRoomById,
} from "@/lib/data";
import { logRequestChange } from "@/lib/request-change-log";
import type { BookingRules, RequestStatus } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function saveAttachmentsFromForm(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  requestId: string,
  formData: FormData
) {
  if (!supabase) return;

  const files = formData.getAll("attachments");
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > 10 * 1024 * 1024) continue;

    const path = `${userId}/${requestId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, file);

    if (uploadError) continue;

    await supabase.from("request_attachments").insert({
      request_id: requestId,
      uploaded_by: userId,
      file_name: file.name,
      file_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    });
  }
}

export type RequestFormState = {
  error?: string;
  success?: boolean;
  requestId?: string;
};

async function parseRequestForm(formData: FormData) {
  const roomId = formData.get("room_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const startAt = formData.get("start_at") as string;
  const endAt = formData.get("end_at") as string;
  const attendeesRaw = formData.get("attendees") as string;
  const attendees = attendeesRaw ? Number(attendeesRaw) : null;
  const recurring = formData.get("recurring") === "on";
  const recurrenceFrequency = formData.get("recurrence_frequency") as
    | "weekly"
    | "monthly"
    | null;
  const recurrenceCount = Number(formData.get("recurrence_count") || "1");

  return {
    roomId,
    title,
    description,
    startAt,
    endAt,
    attendees,
    recurring,
    recurrenceFrequency,
    recurrenceCount,
  };
}

export async function createReservationRequest(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté pour faire une demande." };

  const parsed = await parseRequestForm(formData);
  const { roomId, title, description, startAt, endAt, attendees } = parsed;

  if (!roomId || !title || !startAt || !endAt) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Les dates saisies ne sont pas valides." };
  }

  const rules = await getBookingRules();
  const rulesError = validateBookingDates(start, end, rules);
  if (rulesError) return { error: rulesError };

  if (!UUID_RE.test(roomId)) {
    return { error: "Rechargez la page pour utiliser les données Supabase." };
  }

  const profileResult = await ensureProfile(supabase, user);
  if (!profileResult.ok) return { error: profileResult.error };

  const room = await getRoomById(roomId);
  const requiredSteps = room?.requires_second_approval ? 2 : 1;

  const slots =
    parsed.recurring && parsed.recurrenceFrequency && parsed.recurrenceCount > 1
      ? addRecurrenceDates(start, end, {
          frequency: parsed.recurrenceFrequency,
          count: Math.min(parsed.recurrenceCount, 12),
        })
      : [{ start, end }];

  for (const slot of slots) {
    const conflict = await checkBookingConflict(
      roomId,
      slot.start.toISOString(),
      slot.end.toISOString()
    );
    if (conflict) {
      return {
        error: `Conflit détecté le ${slot.start.toLocaleDateString("fr-FR")} : la salle ou une salle liée est déjà réservée.`,
      };
    }
    const blackout = await checkBlackoutConflict(
      roomId,
      slot.start.toISOString(),
      slot.end.toISOString()
    );
    if (blackout) {
      return {
        error: `Créneau indisponible le ${slot.start.toLocaleDateString("fr-FR")} : période bloquée (maintenance ou fermeture).`,
      };
    }
  }

  const inserts = slots.map((slot, index) => ({
    room_id: roomId,
    requester_id: user.id,
    title: slots.length > 1 ? `${title} (${index + 1}/${slots.length})` : title,
    description,
    start_at: slot.start.toISOString(),
    end_at: slot.end.toISOString(),
    attendees,
    status: "pending" as const,
    approval_step: 1,
    required_approval_steps: requiredSteps,
    recurrence_rule:
      parsed.recurring && parsed.recurrenceFrequency
        ? { frequency: parsed.recurrenceFrequency, count: slots.length }
        : null,
    parent_request_id: index > 0 ? null : null,
  }));

  let { data: inserted, error } = await supabase
    .from("reservation_requests")
    .insert(inserts)
    .select("id");

  if (
    error &&
    (error.message.includes("approval_step") ||
      error.message.includes("recurrence_rule") ||
      error.message.includes("schema cache"))
  ) {
    console.warn(
      "createReservationRequest: migration features manquante, insertion sans colonnes étendues."
    );
    const basicInserts = inserts.map(
      ({
        approval_step: _a,
        required_approval_steps: _r,
        recurrence_rule: _rr,
        parent_request_id: _p,
        ...rest
      }) => rest
    );
    ({ data: inserted, error } = await supabase
      .from("reservation_requests")
      .insert(basicInserts)
      .select("id"));
  }

  if (error) {
    console.error("createReservationRequest:", error.message);
    if (error.message.includes("schema cache")) {
      return {
        error:
          "La base Supabase n'est pas à jour. Exécutez la migration supabase/migrations/20250609120000_features.sql dans le SQL Editor.",
      };
    }
    return { error: "Impossible d'envoyer la demande. Réessayez plus tard." };
  }

  for (const row of inserted ?? []) {
    await logRequestChange(supabase, {
      requestId: row.id,
      actorId: user.id,
      action: "created",
    });
  }

  const primaryId = inserted?.[0]?.id;
  if (primaryId) {
    await saveAttachmentsFromForm(supabase, user.id, primaryId, formData);
    revalidatePath(`/mes-demandes/${primaryId}`);
  }

  revalidatePath("/mes-demandes");
  revalidatePath("/validation");
  revalidatePath("/calendrier");
  revalidatePath("/tableau-de-bord");
  return { success: true, requestId: primaryId };
}

export async function reviewReservationRequest(
  requestId: string,
  status: Extract<RequestStatus, "approved" | "rejected">,
  comment?: string
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const { data: request } = await supabase
    .from("reservation_requests")
    .select("*, rooms(requires_second_approval)")
    .eq("id", requestId)
    .eq("status", "pending")
    .single();

  if (!request) return { error: "Demande introuvable ou déjà traitée." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Non autorisé." };

  const req = request as {
    approval_step: number;
    required_approval_steps: number;
    room_id: string;
    start_at: string;
    end_at: string;
  };

  if (status === "approved") {
    const conflict = await checkBookingConflict(
      req.room_id,
      req.start_at,
      req.end_at,
      requestId
    );
    if (conflict) {
      return { error: "Conflit : une autre réservation chevauche ce créneau." };
    }

    if (req.approval_step >= 2 && profile.role !== "admin") {
      return { error: "Seul un administrateur peut valider l'étape finale." };
    }

    if (req.approval_step === 1 && req.required_approval_steps > 1) {
      const { error } = await supabase
        .from("reservation_requests")
        .update({
          approval_step: 2,
          review_comment: comment?.trim() || null,
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) return { error: "Impossible de passer à l'étape 2." };
      revalidatePath("/validation");
      return { success: true };
    }
  }

  const { error } = await supabase
    .from("reservation_requests")
    .update({
      status,
      review_comment: comment?.trim() || null,
      reviewer_id: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) return { error: "Impossible de traiter la demande." };

  revalidatePath("/validation");
  revalidatePath("/mes-demandes");
  revalidatePath("/calendrier");
  revalidatePath("/tableau-de-bord");
  return { success: true };
}

export async function updateReservationRequest(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const requestId = formData.get("request_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const startAt = formData.get("start_at") as string;
  const endAt = formData.get("end_at") as string;

  if (!requestId || !title || !startAt || !endAt) {
    return { error: "Champs obligatoires manquants." };
  }

  const existing = await getRequestById(requestId);
  if (!existing || existing.requester_id !== user.id || existing.status !== "pending") {
    return { error: "Demande non modifiable." };
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Dates invalides." };
  }

  const rules = await getBookingRules();
  const rulesError = validateBookingDates(start, end, rules);
  if (rulesError) return { error: rulesError };

  const conflict = await checkBookingConflict(
    existing.room_id,
    start.toISOString(),
    end.toISOString(),
    requestId
  );
  if (conflict) return { error: "Conflit avec une autre réservation." };

  const blackout = await checkBlackoutConflict(
    existing.room_id,
    start.toISOString(),
    end.toISOString()
  );
  if (blackout) return { error: "Créneau bloqué (maintenance ou fermeture)." };

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  if (existing.title !== title) {
    changes.title = { old: existing.title, new: title };
  }
  if (existing.start_at !== start.toISOString()) {
    changes.start_at = { old: existing.start_at, new: start.toISOString() };
  }
  if (existing.end_at !== end.toISOString()) {
    changes.end_at = { old: existing.end_at, new: end.toISOString() };
  }

  if (Object.keys(changes).length === 0) {
    return { error: "Aucune modification détectée." };
  }

  const { error } = await supabase
    .from("reservation_requests")
    .update({
      title,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
    })
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  if (error) return { error: "Mise à jour impossible." };

  await logRequestChange(supabase, {
    requestId,
    actorId: user.id,
    action: "updated",
    changes,
  });

  revalidatePath(`/mes-demandes/${requestId}`);
  revalidatePath("/mes-demandes");
  revalidatePath("/validation");
  revalidatePath("/calendrier");
  return { success: true };
}

export async function cancelReservationRequest(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const requestId = formData.get("request_id") as string;
  const reason = (formData.get("reason") as string)?.trim();

  if (!requestId) return { error: "Demande introuvable." };
  if (!reason) return { error: "Le motif d'annulation est obligatoire." };

  const { error } = await supabase
    .from("reservation_requests")
    .update({
      status: "cancelled",
      cancellation_reason: reason,
    })
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  if (error) {
    if (error.message.includes("cancellation_reason")) {
      const { error: fallbackError } = await supabase
        .from("reservation_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId)
        .eq("requester_id", user.id)
        .eq("status", "pending");
      if (fallbackError) return { error: "Impossible d'annuler la demande." };
    } else {
      return { error: "Impossible d'annuler la demande." };
    }
  }

  await logRequestChange(supabase, {
    requestId,
    actorId: user.id,
    action: "cancelled",
    reason,
  });

  revalidatePath("/mes-demandes");
  revalidatePath(`/mes-demandes/${requestId}`);
  revalidatePath("/calendrier");
  return { success: true };
}

export async function addRequestComment(
  requestId: string,
  body: string
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const text = body.trim();
  if (!text) return { error: "Commentaire vide." };

  const { error } = await supabase.from("request_comments").insert({
    request_id: requestId,
    author_id: user.id,
    body: text,
  });

  if (error) return { error: "Impossible d'ajouter le commentaire." };

  revalidatePath(`/mes-demandes/${requestId}`);
  return { success: true };
}

export async function uploadRequestAttachment(
  requestId: string,
  formData: FormData
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Fichier manquant." };
  if (file.size > 10 * 1024 * 1024) return { error: "Fichier trop volumineux (max 10 Mo)." };

  const path = `${user.id}/${requestId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(path, file);

  if (uploadError) {
    return { error: "Upload impossible. Vérifiez le bucket Storage « attachments »." };
  }

  const { error } = await supabase.from("request_attachments").insert({
    request_id: requestId,
    uploaded_by: user.id,
    file_name: file.name,
    file_path: path,
    mime_type: file.type,
    size_bytes: file.size,
  });

  if (error) return { error: "Métadonnées non enregistrées." };

  revalidatePath(`/mes-demandes/${requestId}`);
  return { success: true };
}

export async function updateRoomActive(
  roomId: string,
  isActive: boolean
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Réservé aux administrateurs." };

  const { error } = await supabase
    .from("rooms")
    .update({ is_active: isActive })
    .eq("id", roomId);

  if (error) return { error: "Mise à jour impossible." };

  revalidatePath("/admin/salles");
  revalidatePath("/salles");
  return { success: true };
}

export async function updateBookingRules(
  rules: BookingRules
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Réservé aux administrateurs." };

  const { error } = await supabase
    .from("app_settings")
    .update({ value: rules, updated_at: new Date().toISOString() })
    .eq("key", "booking_rules");

  if (error) return { error: "Sauvegarde impossible." };

  revalidatePath("/admin/regles");
  return { success: true };
}
