"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Room, Service } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ValidationFiltersProps = {
  rooms: Room[];
  services: Service[];
};

export function ValidationFilters({ rooms, services }: ValidationFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [roomId, setRoomId] = useState(params.get("roomId") ?? "all");
  const [serviceId, setServiceId] = useState(params.get("serviceId") ?? "all");
  const [sort, setSort] = useState(params.get("sort") ?? "oldest");
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");

  function apply() {
    const next = new URLSearchParams();
    if (roomId !== "all") next.set("roomId", roomId);
    if (serviceId !== "all") next.set("serviceId", serviceId);
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    if (sort !== "oldest") next.set("sort", sort);
    router.push(`/validation?${next.toString()}`);
  }

  return (
    <div className="mb-6 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1">
        <Label>Salle</Label>
        <Select value={roomId} onValueChange={setRoomId}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Service</Label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger>
            <SelectValue placeholder="Tous" />
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
      <div className="space-y-1">
        <Label>À partir du</Label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Jusqu&apos;au</Label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Tri</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oldest">Plus anciennes d&apos;abord</SelectItem>
            <SelectItem value="newest">Plus récentes d&apos;abord</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
        <Button type="button" size="sm" onClick={apply}>
          Filtrer
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/validation")}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
