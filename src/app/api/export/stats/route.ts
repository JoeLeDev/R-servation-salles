import { NextResponse } from "next/server";
import { getExportStats, requireRole } from "@/lib/data";

export async function GET(request: Request) {
  const profile = await requireRole(["admin", "service_manager"]);
  if (!profile) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const serviceId = searchParams.get("serviceId");

  const stats = await getExportStats(month, serviceId);
  return NextResponse.json(stats);
}
