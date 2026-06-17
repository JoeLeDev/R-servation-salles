"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomType } from "@/types/database";

const TYPES: { value: RoomType | "all"; label: string }[] = [
  { value: "all", label: "Tous les types" },
  { value: "auditorium", label: "Auditorium" },
  { value: "salle_polyvalente", label: "Salles polyvalentes" },
  { value: "salon", label: "Salons" },
  { value: "studio", label: "Studios" },
  { value: "espace_enfants", label: "Espaces enfants" },
];

export function RoomFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    }
    router.push(`/salles?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une salle..."
            className="pl-9"
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateParams({ q: e.target.value })}
          />
        </div>
        <Select
          defaultValue={searchParams.get("type") ?? "all"}
          onValueChange={(v) => updateParams({ type: v })}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label className="text-xs text-muted-foreground">Capacité min.</Label>
          <Input
            type="number"
            min={1}
            placeholder="ex. 50"
            defaultValue={searchParams.get("cap") ?? ""}
            onChange={(e) => updateParams({ cap: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Surface min. (m²)</Label>
          <Input
            type="number"
            min={1}
            placeholder="ex. 100"
            defaultValue={searchParams.get("surface") ?? ""}
            onChange={(e) => updateParams({ surface: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Tarif max. (€)</Label>
          <Input
            type="number"
            min={0}
            placeholder="ex. 2000"
            defaultValue={searchParams.get("price") ?? ""}
            onChange={(e) => updateParams({ price: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Équipement</Label>
          <Input
            placeholder="ex. visio"
            defaultValue={searchParams.get("equip") ?? ""}
            onChange={(e) => updateParams({ equip: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
