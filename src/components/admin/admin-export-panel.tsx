"use client";

import { useState } from "react";
import type { ExportStats, Service } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminExportPanel({
  services,
  initialStats,
  initialMonth,
}: {
  services: Service[];
  initialStats: ExportStats;
  initialMonth: string;
}) {
  const [month, setMonth] = useState(initialMonth);
  const [serviceId, setServiceId] = useState("all");
  const [stats, setStats] = useState(initialStats);

  async function loadStats() {
    const params = new URLSearchParams({ month });
    if (serviceId !== "all") params.set("serviceId", serviceId);
    const res = await fetch(`/api/export/stats?${params}`);
    if (res.ok) setStats(await res.json());
  }

  function openReport() {
    const params = new URLSearchParams({ month });
    if (serviceId !== "all") params.set("serviceId", serviceId);
    window.open(`/api/export/report?${params}`, "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <div className="space-y-1">
          <Label>Mois</Label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex h-9 rounded-md border px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label>Service</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={loadStats}>
          Actualiser
        </Button>
        <Button type="button" variant="outline" onClick={openReport}>
          Rapport PDF (impression)
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total demandes" value={stats.total} />
        <StatCard label="Approuvées" value={stats.approved} />
        <StatCard label="Refusées" value={stats.rejected} />
        <StatCard label="En attente" value={stats.pending} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Taux d'acceptation" value={`${stats.approvalRate} %`} />
        <StatCard label="Taux de refus" value={`${stats.rejectionRate} %`} />
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">Occupation par salle — {stats.serviceName}</h3>
        {stats.occupancyByRoom.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune donnée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Salle</th>
                <th className="p-2">Réservations</th>
                <th className="p-2">Heures</th>
              </tr>
            </thead>
            <tbody>
              {stats.occupancyByRoom.map((row) => (
                <tr key={row.roomName} className="border-b">
                  <td className="p-2">{row.roomName}</td>
                  <td className="p-2">{row.count}</td>
                  <td className="p-2">{Math.round(row.hours)} h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
