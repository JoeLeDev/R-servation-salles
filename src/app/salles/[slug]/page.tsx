import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users, Ruler, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRoomBySlug } from "@/lib/data";
import {
  formatCapacity,
  formatPrice,
  formatRoomType,
  formatSurface,
} from "@/lib/format";
import { RequestForm } from "@/components/requests/request-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RoomPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const supabase = await createClient();
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;

  if (!user) {
    redirect(`/connexion?redirect=/salles/${slug}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/salles">
          <ArrowLeft className="mr-2 size-4" />
          Retour aux salles
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
              <Badge variant="secondary">{formatRoomType(room.room_type)}</Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Service : {room.services?.name}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Ruler className="size-4 text-muted-foreground" />
                <span>Surface : {formatSurface(room.surface_sqm)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="size-4 text-muted-foreground" />
                <span>Capacité : {formatCapacity(room.capacity)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="size-4 text-muted-foreground" />
                <span>Tarif : {formatPrice(room.pricing_type, room.base_price)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Le plan interactif de cette salle sera ajouté prochainement.
          </div>
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Demande de réservation</CardTitle>
            <CardDescription>
              Remplissez le formulaire ci-dessous. Le service {room.services?.name}{" "}
              traitera votre demande.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RequestForm room={room} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
