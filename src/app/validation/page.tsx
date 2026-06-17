import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAllRoomsAdmin,
  getCurrentProfile,
  getPendingRequestsForReview,
  getServices,
} from "@/lib/data";
import { formatDateRange } from "@/lib/format";
import { ReviewActions } from "@/components/requests/review-actions";
import { StatusBadge } from "@/components/requests/status-badge";
import { ValidationFilters } from "@/components/validation/validation-filters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<{
    roomId?: string;
    serviceId?: string;
    from?: string;
    to?: string;
    sort?: "oldest" | "newest";
  }>;
};

export default async function ValidationPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    redirect("/connexion?redirect=/validation");
  }

  const profile = await getCurrentProfile();

  if (!profile || !["service_manager", "admin"].includes(profile.role)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Accès restreint</h1>
        <p className="mt-3 text-muted-foreground">
          Cette page est réservée aux responsables de service et aux
          administrateurs.
        </p>
      </div>
    );
  }

  const filters = await searchParams;
  const [requests, rooms, services] = await Promise.all([
    getPendingRequestsForReview({
      roomId: filters.roomId,
      serviceId: filters.serviceId,
      from: filters.from ? `${filters.from}T00:00:00` : undefined,
      to: filters.to ? `${filters.to}T23:59:59` : undefined,
      sort: filters.sort ?? "oldest",
    }),
    getAllRoomsAdmin(),
    getServices(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Validation des demandes
        </h1>
        <p className="mt-2 text-muted-foreground">
          {requests.length} demande{requests.length > 1 ? "s" : ""} en attente
          de traitement.
        </p>
      </div>

      <Suspense fallback={null}>
        <ValidationFilters rooms={rooms} services={services} />
      </Suspense>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Aucune demande en attente.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{request.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {request.rooms?.name} ·{" "}
                    {formatDateRange(request.start_at, request.end_at)}
                  </CardDescription>
                  {request.profiles && (
                    <p className="mt-2 text-sm">
                      Demandeur :{" "}
                      <span className="font-medium">
                        {request.profiles.full_name ?? request.profiles.email}
                      </span>
                    </p>
                  )}
                </div>
                <StatusBadge status={request.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                {request.description && (
                  <p className="text-sm text-muted-foreground">
                    {request.description}
                  </p>
                )}
                {request.attendees && (
                  <p className="text-sm text-muted-foreground">
                    Participants : {request.attendees}
                  </p>
                )}
                <ReviewActions
                  requestId={request.id}
                  approvalStep={request.approval_step}
                  requiredSteps={request.required_approval_steps}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
