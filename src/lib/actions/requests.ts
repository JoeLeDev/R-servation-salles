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
  checkBookingConflict,
  getBookingRules,
  getCurrentProfile,
  getRoomById,
} from "@/lib/data";
import type { BookingRules, RequestStatus, UserRole } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RequestFormState = { error?: string; success?: boolean };

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

  const { error } = await supabase.from("reservation_requests").insert(inserts);

  if (error) {
    console.error("createReservationRequest:", error.message);
    return { error: "Impossible d'envoyer la demande. Réessayez plus tard." };
  }

  revalidatePath("/mes-demandes");
  revalidatePath("/validation");
  revalidatePath("/calendrier");
  revalidatePath("/tableau-de-bord");
  return { success: true };
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

export async function cancelReservationRequest(
  requestId: string
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const { error } = await supabase
    .from("reservation_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  if (error) return { error: "Impossible d'annuler la demande." };

  revalidatePath("/mes-demandes");
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

export async function updateUserRole(
  userId: string,
  role: UserRole,
  serviceId: string | null
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Non configuré." };

  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Réservé aux administrateurs." };

  const { error } = await supabase
    .from("profiles")
    .update({ role, service_id: serviceId })
    .eq("id", userId);

  if (error) return { error: "Mise à jour impossible." };

  revalidatePath("/admin");
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

  revalidatePath("/admin");
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

  revalidatePath("/admin");
  return { success: true };
}
