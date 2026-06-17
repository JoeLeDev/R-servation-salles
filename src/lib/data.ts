import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEFAULT_BOOKING_RULES } from "@/lib/booking-rules";
import { FALLBACK_ROOMS } from "@/lib/rooms-fallback";
import { relationName } from "@/lib/supabase/relations";
import type {
  BookingRules,
  CalendarEvent,
  DashboardStats,
  Profile,
  RequestAttachment,
  RequestComment,
  ReservationRequest,
  Room,
  RoomType,
  UserRole,
} from "@/types/database";

export type RoomFilters = {
  type?: RoomType | "all";
  search?: string;
  minCapacity?: number;
  minSurface?: number;
  maxPrice?: number;
  equipment?: string;
};

export async function getRooms(filters?: RoomFilters): Promise<Room[]> {
  const supabase = await createClient();
  if (!supabase) return filterFallbackRooms(filters);

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
  if (filters?.minCapacity) {
    query = query.gte("capacity", filters.minCapacity);
  }
  if (filters?.minSurface) {
    query = query.gte("surface_sqm", filters.minSurface);
  }
  if (filters?.maxPrice) {
    query = query.lte("base_price", filters.maxPrice);
  }

  const { data, error } = await query;
  if (error || !data?.length) return filterFallbackRooms(filters);

  let rooms = data as Room[];
  if (filters?.equipment) {
    const q = filters.equipment.toLowerCase();
    rooms = rooms.filter((r) =>
      (r.equipment ?? []).some((e) => e.toLowerCase().includes(q))
    );
  }
  return rooms;
}

function filterFallbackRooms(filters?: RoomFilters): Room[] {
  let rooms = FALLBACK_ROOMS;
  if (filters?.type && filters.type !== "all") {
    rooms = rooms.filter((r) => r.room_type === filters.type);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rooms = rooms.filter((r) => r.name.toLowerCase().includes(q));
  }
  if (filters?.minCapacity) {
    rooms = rooms.filter((r) => (r.capacity ?? 0) >= filters.minCapacity!);
  }
  if (filters?.minSurface) {
    rooms = rooms.filter((r) => (r.surface_sqm ?? 0) >= filters.minSurface!);
  }
  if (filters?.maxPrice) {
    rooms = rooms.filter(
      (r) => r.base_price == null || r.base_price <= filters.maxPrice!
    );
  }
  return rooms;
}

export async function getAllRoomsAdmin(): Promise<Room[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("rooms")
    .select("*, services(id, name)")
    .order("name");

  return (data ?? []) as Room[];
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const supabase = await createClient();
  if (!supabase) return FALLBACK_ROOMS.find((r) => r.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("rooms")
    .select("*, services(id, name, description)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return FALLBACK_ROOMS.find((r) => r.slug === slug) ?? null;
  return data as Room;
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("rooms")
    .select("*, services(id, name)")
    .eq("id", id)
    .single();

  return (data as Room) ?? null;
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

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return [];

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("email");

  return (data ?? []) as Profile[];
}

export async function getServices() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase.from("services").select("*").order("name");
  return data ?? [];
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

  if (error) return [];
  return (data ?? []) as ReservationRequest[];
}

export async function getRequestById(id: string): Promise<ReservationRequest | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("reservation_requests")
    .select("*, rooms(*, services(id, name)), profiles!reservation_requests_requester_id_fkey(id, full_name, email)")
    .eq("id", id)
    .single();

  return (data as ReservationRequest) ?? null;
}

export async function getPendingRequestsForReview(): Promise<ReservationRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const profile = await getCurrentProfile();
  if (!profile || !["service_manager", "admin"].includes(profile.role)) return [];

  let query = supabase
    .from("reservation_requests")
    .select("*, rooms(*, services(id, name)), profiles!reservation_requests_requester_id_fkey(id, full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (profile.role === "service_manager") {
    query = query.eq("approval_step", 1);
    if (profile.service_id) {
      const { data: serviceRooms } = await supabase
        .from("rooms")
        .select("id")
        .eq("service_id", profile.service_id);
      const roomIds = serviceRooms?.map((r) => r.id) ?? [];
      if (!roomIds.length) return [];
      query = query.in("room_id", roomIds);
    }
  }

  if (profile.role === "admin") {
    // Admin voit étape 1 (toutes) + étape 2 (validation direction)
    // Pas de filtre supplémentaire
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as ReservationRequest[];
}

export async function getCalendarEvents(
  from: string,
  to: string,
  roomId?: string
): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("reservation_requests")
    .select("id, title, start_at, end_at, status, room_id, rooms(name)")
    .in("status", ["pending", "approved"])
    .lt("start_at", to)
    .gt("end_at", from)
    .order("start_at");

  if (roomId) query = query.eq("room_id", roomId);

  const { data } = await query;

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      title: string;
      start_at: string;
      end_at: string;
      status: CalendarEvent["status"];
      room_id: string;
      rooms: { name: string } | { name: string }[] | null;
    };
    const room = Array.isArray(r.rooms) ? r.rooms[0] : r.rooms;
    return {
      id: r.id,
      title: r.title,
      start_at: r.start_at,
      end_at: r.end_at,
      status: r.status,
      room_id: r.room_id,
      room_name: room?.name ?? "Salle",
    };
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  if (!supabase) {
    return { totalRooms: 22, pendingRequests: 0, approvedThisMonth: 0, topRooms: [] };
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [rooms, pending, approved, allApproved] = await Promise.all([
    supabase.from("rooms").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("reservation_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("reservation_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("start_at", monthStart.toISOString()),
    supabase
      .from("reservation_requests")
      .select("room_id, rooms(name)")
      .eq("status", "approved"),
  ]);

  const roomCounts = new Map<string, { name: string; count: number }>();
  for (const row of allApproved.data ?? []) {
    const r = row as {
      room_id: string;
      rooms: { name: string } | { name: string }[] | null;
    };
    const name = relationName(r.rooms) || "Inconnu";
    const cur = roomCounts.get(r.room_id) ?? { name, count: 0 };
    cur.count++;
    roomCounts.set(r.room_id, cur);
  }

  const topRooms = [...roomCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRooms: rooms.count ?? 0,
    pendingRequests: pending.count ?? 0,
    approvedThisMonth: approved.count ?? 0,
    topRooms,
  };
}

export async function searchAll(query: string): Promise<{
  rooms: Room[];
  requests: ReservationRequest[];
}> {
  const supabase = await createClient();
  if (!supabase || !query.trim()) return { rooms: [], requests: [] };

  const profile = await getCurrentProfile();
  const q = `%${query.trim()}%`;

  const roomsPromise = supabase
    .from("rooms")
    .select("*, services(id, name)")
    .eq("is_active", true)
    .ilike("name", q)
    .limit(10);

  let requestsQuery = supabase
    .from("reservation_requests")
    .select("*, rooms(name)")
    .ilike("title", q)
    .limit(10);

  if (profile?.role === "employee") {
    requestsQuery = requestsQuery.eq("requester_id", profile.id);
  }

  const [roomsRes, requestsRes] = await Promise.all([roomsPromise, requestsQuery]);

  return {
    rooms: (roomsRes.data ?? []) as Room[],
    requests: (requestsRes.data ?? []) as ReservationRequest[],
  };
}

export async function getRequestComments(requestId: string): Promise<RequestComment[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("request_comments")
    .select("*, profiles(full_name, email)")
    .eq("request_id", requestId)
    .order("created_at");

  return (data ?? []) as RequestComment[];
}

export async function getRequestAttachments(
  requestId: string
): Promise<RequestAttachment[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("request_attachments")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at");

  return (data ?? []) as RequestAttachment[];
}

export async function checkBookingConflict(
  roomId: string,
  startAt: string,
  endAt: string,
  excludeRequestId?: string
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("has_booking_conflict", {
    p_room_id: roomId,
    p_start_at: startAt,
    p_end_at: endAt,
    p_exclude_request_id: excludeRequestId ?? null,
  });

  if (error) {
    console.error("checkBookingConflict:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function getBookingRules(): Promise<BookingRules> {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_BOOKING_RULES;

  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "booking_rules")
    .single();

  return (data?.value as BookingRules) ?? DEFAULT_BOOKING_RULES;
}

export async function requireRole(roles: UserRole[]): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  if (!profile || !roles.includes(profile.role)) return null;
  return profile;
}
