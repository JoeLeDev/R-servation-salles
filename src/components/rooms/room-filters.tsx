"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const currentType = searchParams.get("type") ?? "all";
  const currentSearch = searchParams.get("q") ?? "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/salles?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une salle..."
          className="pl-9"
          defaultValue={currentSearch}
          onChange={(e) => updateParams("q", e.target.value)}
        />
      </div>
      <Select value={currentType} onValueChange={(v) => updateParams("type", v)}>
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Type de salle" />
        </SelectTrigger>
        <SelectContent>
          {TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
