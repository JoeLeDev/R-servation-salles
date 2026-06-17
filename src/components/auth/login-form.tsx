"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthCallbackUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { isEmailDomainAllowed, emailDomainError } from "@/lib/email-domain";

type LoginFormProps = {
  redirectTo?: string;
  allowedDomains?: string[];
};

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("redirect") || lower.includes("url")) {
    return "URL de redirection non autorisée. Ajoutez votre domaine Vercel dans Supabase → Authentication → URL Configuration.";
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many") ||
    lower.includes("429") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit")
  ) {
    return "Trop de demandes de connexion envoyées. Attendez environ 1 heure avant de réessayer (limite Supabase).";
  }

  if (lower.includes("invalid") && lower.includes("email")) {
    return "Adresse email invalide.";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "Les inscriptions sont désactivées. Contactez l'administrateur.";
  }

  return message;
}

export function LoginForm({ redirectTo = "/salles", allowedDomains = [] }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        Supabase n&apos;est pas configuré sur ce déploiement. Ajoutez{" "}
        <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
        <code className="text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
        dans les variables d&apos;environnement Vercel, puis redéployez.
      </p>
    );
  }

  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectUrl = getAuthCallbackUrl(redirectTo);

    if (!isEmailDomainAllowed(email, { domains: allowedDomains })) {
      setError(emailDomainError({ domains: allowedDomains }));
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setLoading(false);

    if (signInError) {
      setError(mapAuthError(signInError.message));
      return;
    }

    setMessage(
      "Un lien de connexion a été envoyé à votre adresse email. Vérifiez aussi vos spams."
    );
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(redirectTo),
      },
    });

    if (signInError) {
      setLoading(false);
      setError(mapAuthError(signInError.message));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          Recevoir un lien de connexion
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          ou
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        Continuer avec Google
      </Button>

      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
