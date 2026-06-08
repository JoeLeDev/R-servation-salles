import Link from "next/link";
import { ArrowRight, Users, Ruler } from "lucide-react";
import type { Room } from "@/types/database";
import {
  formatCapacity,
  formatPrice,
  formatRoomType,
  formatSurface,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RoomCardProps = {
  room: Room;
};

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl">{room.name}</CardTitle>
            <CardDescription className="mt-1">
              {room.services?.name ?? formatRoomType(room.room_type)}
            </CardDescription>
          </div>
          <Badge variant="secondary">{formatRoomType(room.room_type)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Ruler className="size-4" />
          <span>{formatSurface(room.surface_sqm)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <span>{formatCapacity(room.capacity)}</span>
        </div>
        <p className="font-medium text-foreground">
          {formatPrice(room.pricing_type, room.base_price)}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/salles/${room.slug}`}>
            Faire une demande
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
