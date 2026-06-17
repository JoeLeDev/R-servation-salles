"use client";

import Image from "next/image";
import type { RoomExtendedDetails } from "@/lib/room-details";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const layoutLabels: {
  key: keyof NonNullable<RoomExtendedDetails["layoutCapacities"]>;
  label: string;
}[] = [
  { key: "u", label: "En U" },
  { key: "meeting", label: "Réunion" },
  { key: "conference", label: "Conférence" },
  { key: "classroom", label: "Classe" },
  { key: "banquet", label: "Banquet" },
  { key: "cocktail", label: "Cocktail" },
];

type RoomDetailsPanelProps = {
  details: RoomExtendedDetails;
};

function FeatureTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-t first:border-t-0">
            <td className="p-2.5 font-medium">{row.label}</td>
            <td className="p-2.5 text-muted-foreground">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RoomDetailsPanel({ details }: RoomDetailsPanelProps) {
  const hasGallery = (details.images?.length ?? 0) > 0;
  const hasFeatures = (details.features?.length ?? 0) > 0;
  const hasCapacities = !!details.layoutCapacities;
  const hasPricing = (details.pricing?.length ?? 0) > 0;

  const defaultTab = hasGallery
    ? "galerie"
    : hasFeatures
      ? "equipements"
      : hasCapacities
        ? "capacites"
        : "tarifs";

  return (
    <Card>
      <CardContent className="pt-4">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-3 w-full flex-wrap h-auto">
            {hasGallery && <TabsTrigger value="galerie">Galerie</TabsTrigger>}
            {hasFeatures && (
              <TabsTrigger value="equipements">Équipements</TabsTrigger>
            )}
            {hasCapacities && (
              <TabsTrigger value="capacites">Capacités</TabsTrigger>
            )}
            {hasPricing && <TabsTrigger value="tarifs">Tarifs</TabsTrigger>}
          </TabsList>

          {hasGallery && (
            <TabsContent value="galerie">
              <div className="grid gap-2 sm:grid-cols-2">
                {details.images!.map((image) => (
                  <div
                    key={image.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 280px"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {hasFeatures && (
            <TabsContent value="equipements">
              <FeatureTable rows={details.features!} />
            </TabsContent>
          )}

          {hasCapacities && (
            <TabsContent value="capacites">
              <FeatureTable
                rows={layoutLabels.map(({ key, label }) => {
                  const value = details.layoutCapacities?.[key];
                  return {
                    label,
                    value: value != null ? `${value} personnes` : "—",
                  };
                })}
              />
            </TabsContent>
          )}

          {hasPricing && (
            <TabsContent value="tarifs">
              <FeatureTable rows={details.pricing!} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
