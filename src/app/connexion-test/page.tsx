import Link from "next/link";
import { notFound } from "next/navigation";
import { PasswordLoginForm } from "@/components/auth/password-login-form";
import { getEmailDomainSettings } from "@/lib/data";
import { isTestLoginEnabled } from "@/lib/test-login";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConnexionTestPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function ConnexionTestPage({
  searchParams,
}: ConnexionTestPageProps) {
  if (!isTestLoginEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/")
    ? params.redirect
    : "/salles";
  const emailDomains = await getEmailDomainSettings();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connexion test</CardTitle>
          <CardDescription>
            Email + mot de passe — sans lien magique. Réservé aux tests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <strong>Page de développement.</strong> N&apos;utilisez pas en
            production sans mot de passe fort. Activez le provider Email +
            mot de passe dans Supabase.
          </div>

          <PasswordLoginForm
            redirectTo={redirectTo}
            allowedDomains={emailDomains.domains}
          />

          <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Configuration Supabase</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Authentication → Providers → Email → activer</li>
              <li>Cocher « Enable Email provider » et sauvegarder</li>
              <li>
                Ou créer un utilisateur : Authentication → Users → Add user
              </li>
            </ol>
          </div>

          <p className="text-center text-sm">
            <Link
              href="/connexion"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Connexion normale (lien magique)
            </Link>
            {" · "}
            <Link
              href="/salles"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Salles
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
