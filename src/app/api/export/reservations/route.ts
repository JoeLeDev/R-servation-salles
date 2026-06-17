import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/data";
import { relationName } from "@/lib/supabase/relations";

export async function GET() {
  const profile = await requireRole(["admin", "service_manager"]);
  if (!profile) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Non configuré" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("reservation_requests")
    .select("title, status, start_at, end_at, attendees, rooms(name), profiles!reservation_requests_requester_id_fkey(email, full_name)")
    .order("start_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "Titre",
    "Statut",
    "Début",
    "Fin",
    "Participants",
    "Salle",
    "Demandeur",
    "Email",
  ];

  const rows = (data ?? []).map((row) => {
    const r = row as {
      title: string;
      status: string;
      start_at: string;
      end_at: string;
      attendees: number | null;
      rooms: { name: string } | { name: string }[] | null;
      profiles:
        | { full_name: string | null; email: string }
        | { full_name: string | null; email: string }[]
        | null;
    };
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return [
      r.title,
      r.status,
      r.start_at,
      r.end_at,
      r.attendees ?? "",
      relationName(r.rooms),
      profile?.full_name ?? "",
      profile?.email ?? "",
    ];
  });

  const csv = [header, ...rows]
    .map((line) =>
      line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
