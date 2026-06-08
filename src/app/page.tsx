import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    icon: Building2,
    title: "Choisissez une salle",
    description:
      "Parcourez les 22 espaces disponibles : auditoriums, studios, salons et espaces enfants.",
  },
  {
    icon: ClipboardCheck,
    title: "Soumettez votre demande",
    description:
      "Indiquez la date, l'horaire et les détails de votre événement.",
  },
  {
    icon: Users,
    title: "Validation par le service",
    description:
      "Le service concerné approuve ou refuse votre demande avec un commentaire.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Cité — Réservation de salles
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Réservez vos espaces en quelques clics
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tout le monde peut faire une demande. Chaque réservation est validée
          par le service responsable de la salle concernée.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/salles">
              Voir les salles
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/connexion">Se connecter</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          );
        })}
      </section>
    </div>
  );
}
