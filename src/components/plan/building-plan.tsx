"use client";

import { useState } from "react";
import type { Room } from "@/types/database";
import {
  PLAN_BUILDINGS,
  PLAN_LEGEND,
  type PlanZoneDef,
} from "@/lib/plan-layout";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BuildingPlanProps = {
  rooms: Pick<Room, "slug" | "name" | "is_active">[];
};

function PlanZone({
  zone,
  active,
}: {
  zone: PlanZoneDef;
  active: boolean;
}) {
  const isBookable = !!zone.roomSlug && active;
  const labelSize = zone.w < 26 || zone.h < 20 ? 5.5 : 6.5;
  const centerX = zone.x + zone.w / 2;
  const centerY = zone.y + zone.h / 2;

  const content = (
    <g
      className={cn(
        "transition-opacity",
        isBookable && "cursor-pointer hover:opacity-90",
        zone.roomSlug && !active && "opacity-40"
      )}
    >
      <rect
        x={zone.x}
        y={zone.y}
        width={zone.w}
        height={zone.h}
        rx={1.5}
        fill={zone.fill}
        fillOpacity={isBookable ? 0.88 : 0.55}
        stroke={isBookable ? "rgba(255,255,255,0.65)" : "rgba(15,23,42,0.12)"}
        strokeWidth={isBookable ? 0.6 : 0.35}
      />
      {zone.w >= 18 && zone.h >= 14 && (
        <>
          <text
            x={centerX}
            y={centerY - (zone.subtitle ? 2 : 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={labelSize}
            fontWeight={600}
            fill={zone.textColor ?? (isBookable ? "#ffffff" : "#334155")}
            className="pointer-events-none select-none"
          >
            {zone.label}
          </text>
          {zone.subtitle && zone.h >= 22 && (
            <text
              x={centerX}
              y={centerY + 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={4.5}
              fill={zone.textColor ?? "rgba(255,255,255,0.85)"}
              className="pointer-events-none select-none"
            >
              {zone.subtitle}
            </text>
          )}
        </>
      )}
    </g>
  );

  if (isBookable) {
    return (
      <a href={`/salles/${zone.roomSlug}`} aria-label={`Réserver ${zone.label}`}>
        {content}
      </a>
    );
  }

  return content;
}

function FloorPanel({
  floorLabel,
  zones,
  activeSlugs,
}: {
  floorLabel: string;
  zones: PlanZoneDef[];
  activeSlugs: Set<string>;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-slate-50">
      <div className="bg-[#1e3a5f] px-3 py-2 text-center text-xs font-semibold tracking-wide text-white">
        {floorLabel}
      </div>
      <div className="flex-1 bg-slate-100 p-2 dark:bg-slate-200">
        <svg
          viewBox="0 0 200 140"
          className="h-auto w-full"
          role="img"
          aria-label={`Plan ${floorLabel}`}
        >
          <rect x={0} y={0} width={200} height={140} fill="#f8fafc" />
          {zones.map((zone) => (
            <PlanZone
              key={zone.id}
              zone={zone}
              active={!zone.roomSlug || activeSlugs.has(zone.roomSlug)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export function BuildingPlan({ rooms }: BuildingPlanProps) {
  const [buildingId, setBuildingId] = useState(PLAN_BUILDINGS[0].id);
  const activeSlugs = new Set(
    rooms.filter((r) => r.is_active).map((r) => r.slug)
  );

  return (
    <div className="space-y-4">
      <Tabs value={buildingId} onValueChange={setBuildingId}>
        <TabsList className="h-10 w-full justify-start bg-[#1e3a5f] p-1">
          {PLAN_BUILDINGS.map((b) => (
            <TabsTrigger
              key={b.id}
              value={b.id}
              className="flex-1 text-sky-100 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
            >
              {b.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PLAN_BUILDINGS.map((b) => (
          <TabsContent key={b.id} value={b.id} className="mt-4">
            <div
              className={cn(
                "grid gap-3",
                b.floors.length === 2 && "md:grid-cols-2",
                b.floors.length === 3 && "lg:grid-cols-3"
              )}
            >
              {b.floors.map((floor) => (
                <FloorPanel
                  key={floor.id}
                  floorLabel={floor.label}
                  zones={floor.zones}
                  activeSlugs={activeSlugs}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-3">
        {PLAN_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span
              className="size-3 rounded-sm border border-black/10"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-3 rounded-sm border border-dashed border-primary/50 bg-primary/10" />
          Cliquez sur une salle pour réserver
        </div>
      </div>
    </div>
  );
}
