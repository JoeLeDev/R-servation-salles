import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Vous êtes hors ligne</h1>
      <p className="mt-3 text-muted-foreground">
        Vérifiez votre connexion internet pour consulter les salles et envoyer
        une demande.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Réessayer</Link>
      </Button>
    </div>
  );
}
