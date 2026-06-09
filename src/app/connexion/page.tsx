import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { isTestLoginEnabled } from "@/lib/test-login";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConnexionPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  auth: "La connexion a échoué. Réessayez ou demandez un nouveau lien.",
  config: "Supabase n'est pas configuré sur ce déploiement.",
};

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/salles";
  const authError = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous avec votre email ou votre compte Google pour faire
            une demande de réservation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {authError}
            </p>
          )}
          <LoginForm redirectTo={redirectTo} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isTestLoginEnabled() && (
              <>
                <Link
                  href={`/connexion-test?redirect=${encodeURIComponent(redirectTo)}`}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Connexion test (email + mot de passe)
                </Link>
                {" · "}
              </>
            )}
            <Link
              href="/salles"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Retour au catalogue des salles
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
