import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { FALLBACK_ROOMS } from "@/lib/rooms-fallback";
import type {
  BookingRules,
  Profile,
  ReservationRequest,
  Room,
  RoomType,
} from "@/types/database";

export async function getRooms(filters?: {
  type?: RoomType | "all";
  search?: string;
}): Promise<Room[]> {
  const supabase = await createClient();
  if (!supabase) {
    return filterFallbackRooms(filters);
  }

  let query = supabase
    .from("rooms")
    .select("*, services(id, name, description)")
    .eq("is_active", true)
    .order("name");

  if (filters?.type && filters.type !== "all") {
    query = query.eq("room_type", filters.type);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getRooms error:", error.message);
    return filterFallbackRooms(filters);
  }

  if (!data || data.length === 0) {
    return filterFallbackRooms(filters);
  }

  return data as Room[];
}

function filterFallbackRooms(filters?: {
  type?: RoomType | "all";
  search?: string;
}): Room[] {
  let rooms = FALLBACK_ROOMS;

  if (filters?.type && filters.type !== "all") {
    rooms = rooms.filter((r) => r.room_type === filters.type);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rooms = rooms.filter((r) => r.name.toLowerCase().includes(q));
  }

  return rooms;
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const supabase = await createClient();
  if (!supabase) {
    return FALLBACK_ROOMS.find((r) => r.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("rooms")
    .select("*, services(id, name, description)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    return FALLBACK_ROOMS.find((r) => r.slug === slug) ?? null;
  }

  return data as Room;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

export async function getMyRequests(): Promise<ReservationRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("reservation_requests")
    .select("*, rooms(*, services(id, name))")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyRequests error:", error.message);
    return [];
  }

  return (data ?? []) as ReservationRequest[];
}

export async function getPendingRequestsForReview(): Promise<
  ReservationRequest[]
> {
  const supabase = await createClient();
  if (!supabase) return [];

  const profile = await getCurrentProfile();

  if (!profile || !["service_manager", "admin"].includes(profile.role)) {
    return [];
  }

  let query = supabase
    .from("reservation_requests")
    .select("*, rooms(*, services(id, name)), profiles!reservation_requests_requester_id_fkey(id, full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (profile.role === "service_manager" && profile.service_id) {
    const { data: serviceRooms } = await supabase
      .from("rooms")
      .select("id")
      .eq("service_id", profile.service_id);

    const roomIds = serviceRooms?.map((r) => r.id) ?? [];
    if (roomIds.length === 0) return [];
    query = query.in("room_id", roomIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPendingRequestsForReview error:", error.message);
    return [];
  }

  return (data ?? []) as ReservationRequest[];
}

export async function getBookingRules(): Promise<BookingRules> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      min_duration_minutes: 30,
      max_duration_hours: 8,
      min_advance_hours: 24,
      cancellation_hours: 2,
      require_approval: true,
    };
  }

  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "booking_rules")
    .single();

  return (
    (data?.value as BookingRules) ?? {
      min_duration_minutes: 30,
      max_duration_hours: 8,
      min_advance_hours: 24,
      cancellation_hours: 2,
      require_approval: true,
    }
  );
}
