import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEFAULT_BOOKING_RULES } from "@/lib/booking-rules";
import { FALLBACK_ROOMS } from "@/lib/rooms-fallback";
import { relationName } from "@/lib/supabase/relations";
import type {
  AvailabilitySlot,
  BookingRules,
  CalendarEvent,
  DashboardStats,
  EmailDomainSettings,
  ExportStats,
  Profile,
  RequestAttachment,
  RequestChangeLog,
  RequestComment,
  ReservationRequest,
  ReviewFilters,
  Room,
  RoomBlackout,
  RoomType,
  UserRole,
} from "@/types/database";
import { expandBlackoutOccurrences } from "@/lib/blackouts";

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

export async function getEmailDomainSettings(): Promise<EmailDomainSettings> {
  const supabase = await createClient();
  if (!supabase) return { domains: [] };

  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "email_domains")
    .single();

  return (data?.value as EmailDomainSettings) ?? { domains: [] };
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

export async function getPendingRequestsForReview(
  filters: ReviewFilters = {}
): Promise<ReservationRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const profile = await getCurrentProfile();
  if (!profile || !["service_manager", "admin"].includes(profile.role)) return [];

  const ascending = filters.sort !== "newest";

  let query = supabase
    .from("reservation_requests")
    .select("*, rooms(*, services(id, name)), profiles!reservation_requests_requester_id_fkey(id, full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending });

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

  if (filters.roomId) query = query.eq("room_id", filters.roomId);
  if (filters.from) query = query.gte("start_at", filters.from);
  if (filters.to) query = query.lte("end_at", filters.to);

  if (filters.serviceId) {
    const { data: serviceRooms } = await supabase
      .from("rooms")
      .select("id")
      .eq("service_id", filters.serviceId);
    const roomIds = serviceRooms?.map((r) => r.id) ?? [];
    if (!roomIds.length) return [];
    query = query.in("room_id", roomIds);
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

  if (!error) return Boolean(data);

  console.warn(
    "checkBookingConflict: fonction RPC indisponible, repli sur requête simple.",
    error.message
  );

  let query = supabase
    .from("reservation_requests")
    .select("id")
    .eq("room_id", roomId)
    .in("status", ["pending", "approved"])
    .lt("start_at", endAt)
    .gt("end_at", startAt)
    .limit(1);

  if (excludeRequestId) {
    query = query.neq("id", excludeRequestId);
  }

  const { data: conflicts, error: fallbackError } = await query;
  if (fallbackError) {
    console.error("checkBookingConflict:", fallbackError.message);
    return false;
  }

  return (conflicts?.length ?? 0) > 0;
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

export async function getRoomAvailability(
  roomId: string,
  from: string,
  to: string
): Promise<AvailabilitySlot[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const rangeFrom = new Date(from);
  const rangeTo = new Date(to);

  const [bookingsRes, blackoutsRes] = await Promise.all([
    supabase
      .from("reservation_requests")
      .select("title, start_at, end_at, status")
      .eq("room_id", roomId)
      .in("status", ["pending", "approved"])
      .lt("start_at", to)
      .gt("end_at", from)
      .order("start_at"),
    supabase
      .from("room_blackouts")
      .select("*")
      .eq("room_id", roomId),
  ]);

  const slots: AvailabilitySlot[] = [];

  for (const row of bookingsRes.data ?? []) {
    const b = row as {
      title: string;
      start_at: string;
      end_at: string;
      status: ReservationRequest["status"];
    };
    slots.push({
      start_at: b.start_at,
      end_at: b.end_at,
      type: "booking",
      title: b.title,
      status: b.status,
    });
  }

  for (const row of blackoutsRes.data ?? []) {
    const blackout = row as RoomBlackout;
    for (const occ of expandBlackoutOccurrences(blackout, rangeFrom, rangeTo)) {
      slots.push({
        start_at: occ.start.toISOString(),
        end_at: occ.end.toISOString(),
        type: "blackout",
        title: occ.title,
      });
    }
  }

  return slots.sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );
}

export async function checkBlackoutConflict(
  roomId: string,
  startAt: string,
  endAt: string
): Promise<boolean> {
  const slots = await getRoomAvailability(roomId, startAt, endAt);
  const start = new Date(startAt);
  const end = new Date(endAt);

  return slots.some((slot) => {
    if (slot.type !== "blackout") return false;
    const s = new Date(slot.start_at);
    const e = new Date(slot.end_at);
    return s < end && e > start;
  });
}

export async function getRequestChangeLog(
  requestId: string
): Promise<RequestChangeLog[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("request_change_log")
    .select("*, profiles(full_name, email)")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  return (data ?? []) as RequestChangeLog[];
}

export async function getRoomBlackouts(roomId?: string): Promise<RoomBlackout[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("room_blackouts")
    .select("*, rooms(name, slug)")
    .order("start_at", { ascending: true });

  if (roomId) query = query.eq("room_id", roomId);

  const { data } = await query;
  return (data ?? []) as RoomBlackout[];
}

export async function getExportStats(
  month: string,
  serviceId?: string | null
): Promise<ExportStats> {
  const supabase = await createClient();
  const empty: ExportStats = {
    month,
    serviceId: serviceId ?? null,
    serviceName: "Tous les services",
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    approvalRate: 0,
    rejectionRate: 0,
    occupancyByRoom: [],
  };

  if (!supabase) return empty;

  const [year, mon] = month.split("-").map(Number);
  const from = new Date(year, mon - 1, 1).toISOString();
  const to = new Date(year, mon, 0, 23, 59, 59).toISOString();

  let query = supabase
    .from("reservation_requests")
    .select("status, start_at, end_at, rooms(name, service_id, services(name))")
    .gte("start_at", from)
    .lte("start_at", to);

  const { data } = await query;
  if (!data) return empty;

  let serviceName = "Tous les services";
  const roomMap = new Map<string, { roomName: string; hours: number; count: number }>();
  const counts = { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };

  for (const row of data) {
    const r = row as unknown as {
      status: ReservationRequest["status"];
      start_at: string;
      end_at: string;
      rooms:
        | { name: string; service_id: string; services: { name: string } | null }
        | { name: string; service_id: string; services: { name: string } | null }[]
        | null;
    };
    const room = Array.isArray(r.rooms) ? r.rooms[0] : r.rooms;
    if (!room) continue;

    if (serviceId && room.service_id !== serviceId) continue;

    if (serviceId && room.services?.name) {
      serviceName = room.services.name;
    }

    counts.total++;
    if (r.status === "pending") counts.pending++;
    else if (r.status === "approved") counts.approved++;
    else if (r.status === "rejected") counts.rejected++;
    else if (r.status === "cancelled") counts.cancelled++;

    const hours =
      (new Date(r.end_at).getTime() - new Date(r.start_at).getTime()) / 3_600_000;
    const cur = roomMap.get(room.name) ?? { roomName: room.name, hours: 0, count: 0 };
    cur.hours += hours;
    cur.count++;
    roomMap.set(room.name, cur);
  }

  const decided = counts.approved + counts.rejected;
  return {
    month,
    serviceId: serviceId ?? null,
    serviceName,
    ...counts,
    approvalRate: decided ? Math.round((counts.approved / decided) * 100) : 0,
    rejectionRate: decided ? Math.round((counts.rejected / decided) * 100) : 0,
    occupancyByRoom: [...roomMap.values()].sort((a, b) => b.hours - a.hours),
  };
}

export async function requireRole(roles: UserRole[]): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  if (!profile || !roles.includes(profile.role)) return null;
  return profile;
}
