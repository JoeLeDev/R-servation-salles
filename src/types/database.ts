export type UserRole = "employee" | "service_manager" | "admin";
export type RoomType =
  | "auditorium"
  | "salle_polyvalente"
  | "salon"
  | "studio"
  | "espace_enfants";
export type PricingType = "from" | "quote" | "free";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type Service = {
  id: string;
  name: string;
  description: string | null;
};

export type Room = {
  id: string;
  slug: string;
  name: string;
  room_type: RoomType;
  surface_sqm: number | null;
  capacity: number | null;
  pricing_type: PricingType;
  base_price: number | null;
  service_id: string;
  description: string | null;
  is_active: boolean;
  services?: Service;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  service_id: string | null;
};

export type ReservationRequest = {
  id: string;
  room_id: string;
  requester_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  attendees: number | null;
  status: RequestStatus;
  reviewer_id: string | null;
  review_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  rooms?: Room;
  profiles?: Profile;
};

export type BookingRules = {
  min_duration_minutes: number;
  max_duration_hours: number;
  min_advance_hours: number;
  cancellation_hours: number;
  require_approval: boolean;
};
