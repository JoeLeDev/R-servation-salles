import type { PricingType, RequestStatus, RoomType } from "@/types/database";

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  auditorium: "Auditorium",
  salle_polyvalente: "Salle polyvalente",
  salon: "Salon",
  studio: "Studio",
  espace_enfants: "Espace enfants",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
  cancelled: "Annulée",
};

export function formatRoomType(type: RoomType): string {
  return ROOM_TYPE_LABELS[type];
}

export function formatPrice(
  pricingType: PricingType,
  basePrice: number | null
): string {
  if (pricingType === "free") return "Gratuit";
  if (pricingType === "quote") return "Sur devis";
  if (basePrice != null) {
    return `Dès ${basePrice.toLocaleString("fr-FR")} €`;
  }
  return "Sur devis";
}

export function formatCapacity(capacity: number | null): string {
  if (capacity == null) return "—";
  return `${capacity.toLocaleString("fr-FR")} pers.`;
}

export function formatSurface(surface: number | null): string {
  if (surface == null) return "—";
  return `${surface.toLocaleString("fr-FR")} m²`;
}

export function formatStatus(status: RequestStatus): string {
  return STATUS_LABELS[status];
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`;
  }

  return `${formatDateTime(start)} → ${formatDateTime(end)}`;
}
