import Image from "next/image";
import type { RoomExtendedDetails } from "@/lib/room-details";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const layoutLabels: { key: keyof NonNullable<RoomExtendedDetails["layoutCapacities"]>; label: string }[] = [
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

export function RoomDetailsPanel({ details }: RoomDetailsPanelProps) {
  return (
    <div className="space-y-6">
      {details.summary && (
        <p className="text-sm leading-relaxed text-muted-foreground">{details.summary}</p>
      )}

      {details.images && details.images.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Galerie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {details.images.map((image) => (
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
          </CardContent>
        </Card>
      )}

      {details.features && details.features.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Équipements & services</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {details.features.map((feature) => (
                  <tr key={feature.label} className="border-t first:border-t-0">
                    <td className="p-3 font-medium">{feature.label}</td>
                    <td className="p-3 text-muted-foreground">{feature.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {details.layoutCapacities && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Capacités par configuration</CardTitle>
            <CardDescription>Nombre de convives selon l&apos;agencement</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {layoutLabels.map(({ key, label }) => {
                  const value = details.layoutCapacities?.[key];
                  return (
                    <tr key={key} className="border-t first:border-t-0">
                      <td className="p-3 font-medium">{label}</td>
                      <td className="p-3 text-muted-foreground">
                        {value != null ? `${value} personnes` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {details.pricing && details.pricing.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tarifs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {details.pricing.map((item) => (
                  <tr key={item.label} className="border-t first:border-t-0">
                    <td className="p-3 font-medium">{item.label}</td>
                    <td className="p-3 text-muted-foreground">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
