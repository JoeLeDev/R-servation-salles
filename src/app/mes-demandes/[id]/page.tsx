import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getCurrentProfile,
  getRequestAttachments,
  getRequestById,
  getRequestComments,
} from "@/lib/data";
import { formatDateRange } from "@/lib/format";
import { RequestAttachments } from "@/components/requests/request-attachments";
import { RequestComments } from "@/components/requests/request-comments";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/connexion?redirect=/mes-demandes/${id}`);

  const request = await getRequestById(id);
  if (!request) notFound();

  const isOwner = request.requester_id === profile.id;
  const isStaff = ["service_manager", "admin"].includes(profile.role);
  if (!isOwner && !isStaff) notFound();

  const [comments, attachments] = await Promise.all([
    getRequestComments(id),
    getRequestAttachments(id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/mes-demandes">← Mes demandes</Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{request.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {request.rooms?.name} · {formatDateRange(request.start_at, request.end_at)}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          {request.description && (
            <p className="text-sm text-muted-foreground">{request.description}</p>
          )}
          {request.review_comment && (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm">
              <strong>Réponse :</strong> {request.review_comment}
            </p>
          )}
          {request.required_approval_steps > 1 && (
            <p className="text-sm text-muted-foreground">
              Validation étape {request.approval_step}/{request.required_approval_steps}
            </p>
          )}

          <RequestComments requestId={id} comments={comments} />
          {isOwner && request.status === "pending" && (
            <RequestAttachments requestId={id} attachments={attachments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
