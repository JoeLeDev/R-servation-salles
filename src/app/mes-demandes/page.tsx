import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyRequests } from "@/lib/data";
import { RequestList } from "@/components/requests/request-list";
import { Button } from "@/components/ui/button";

export default async function MesDemandesPage() {
  const supabase = await createClient();
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;

  if (!user) {
    redirect("/connexion?redirect=/mes-demandes");
  }

  const requests = await getMyRequests();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes demandes</h1>
          <p className="mt-2 text-muted-foreground">
            Suivez l&apos;état de vos demandes de réservation.
          </p>
        </div>
        <Button asChild>
          <Link href="/salles">Nouvelle demande</Link>
        </Button>
      </div>

      <RequestList requests={requests} />
    </div>
  );
}
