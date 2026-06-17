import { getExportStats, requireRole } from "@/lib/data";

export async function GET(request: Request) {
  const profile = await requireRole(["admin", "service_manager"]);
  if (!profile) {
    return new Response("Non autorisé", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const serviceId = searchParams.get("serviceId");

  const stats = await getExportStats(month, serviceId);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport ${stats.serviceName} — ${month}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; }
    h1 { font-size: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1.5rem 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    .card strong { display: block; font-size: 1.5rem; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Imprimer / PDF</button>
  <h1>Rapport mensuel — ${stats.serviceName}</h1>
  <p>Période : ${month}</p>
  <div class="grid">
    <div class="card">Total<strong>${stats.total}</strong></div>
    <div class="card">Approuvées<strong>${stats.approved}</strong></div>
    <div class="card">Refusées<strong>${stats.rejected}</strong></div>
    <div class="card">En attente<strong>${stats.pending}</strong></div>
  </div>
  <p>Taux d'acceptation : <strong>${stats.approvalRate} %</strong> · Taux de refus : <strong>${stats.rejectionRate} %</strong></p>
  <h2>Occupation par salle</h2>
  <table>
    <thead><tr><th>Salle</th><th>Réservations</th><th>Heures</th></tr></thead>
    <tbody>
      ${stats.occupancyByRoom
        .map(
          (r) =>
            `<tr><td>${r.roomName}</td><td>${r.count}</td><td>${Math.round(r.hours)} h</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
