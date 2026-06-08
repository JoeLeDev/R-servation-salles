"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/actions/ensure-profile";
import type { RequestStatus } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RequestFormState = {
  error?: string;
  success?: boolean;
};

export async function createReservationRequest(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase n'est pas configuré." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour faire une demande." };
  }

  const roomId = formData.get("room_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const startAt = formData.get("start_at") as string;
  const endAt = formData.get("end_at") as string;
  const attendeesRaw = formData.get("attendees") as string;
  const attendees = attendeesRaw ? Number(attendeesRaw) : null;

  if (!roomId || !title || !startAt || !endAt) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Les dates saisies ne sont pas valides." };
  }

  if (end <= start) {
    return { error: "La date de fin doit être après la date de début." };
  }

  if (!UUID_RE.test(roomId)) {
    return {
      error:
        "Cette salle provient du mode démo. Rechargez la page pour utiliser les données Supabase.",
    };
  }

  const profileResult = await ensureProfile(supabase, user);
  if (!profileResult.ok) {
    return { error: profileResult.error };
  }

  const { error } = await supabase.from("reservation_requests").insert({
    room_id: roomId,
    requester_id: user.id,
    title,
    description,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    attendees,
    status: "pending",
  });

  if (error) {
    console.error(
      "createReservationRequest error:",
      error.message,
      error.code,
      error.details
    );

    if (error.code === "42501") {
      return {
        error:
          "Permission refusée. Vérifiez que les migrations RLS sont à jour.",
      };
    }

    if (error.code === "23503") {
      return {
        error:
          "Profil ou salle introuvable. Rechargez la page et réessayez.",
      };
    }

    return { error: "Impossible d'envoyer la demande. Réessayez plus tard." };
  }

  revalidatePath("/mes-demandes");
  revalidatePath("/validation");
  return { success: true };
}

export async function reviewReservationRequest(
  requestId: string,
  status: Extract<RequestStatus, "approved" | "rejected">,
  comment?: string
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase n'est pas configuré." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé." };
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

  if (error) {
    return { error: "Impossible de traiter la demande." };
  }

  revalidatePath("/validation");
  revalidatePath("/mes-demandes");
  return { success: true };
}

export async function cancelReservationRequest(
  requestId: string
): Promise<RequestFormState> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase n'est pas configuré." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé." };
  }

  const { error } = await supabase
    .from("reservation_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  if (error) {
    return { error: "Impossible d'annuler la demande." };
  }

  revalidatePath("/mes-demandes");
  return { success: true };
}
