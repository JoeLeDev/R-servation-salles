"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PasswordLoginFormProps = {
  redirectTo?: string;
};

function mapPasswordError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email ou mot de passe incorrect.";
  }

  if (lower.includes("email not confirmed")) {
    return "Email non confirmé. Désactivez la confirmation dans Supabase ou confirmez l'email.";
  }

  if (lower.includes("user already registered")) {
    return "Un compte existe déjà avec cet email. Connectez-vous.";
  }

  if (lower.includes("password") && lower.includes("least")) {
    return "Mot de passe trop court (minimum 6 caractères).";
  }

  return message;
}

export function PasswordLoginForm({ redirectTo = "/salles" }: PasswordLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        Supabase n&apos;est pas configuré.
      </p>
    );
  }

  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(mapPasswordError(signInError.message));
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(mapPasswordError(signUpError.message));
      return;
    }

    setMessage(
      "Compte créé. Si la confirmation email est activée dans Supabase, confirmez avant de vous connecter. Sinon, connectez-vous directement."
    );
  }

  const fields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="test-email">Email</Label>
        <Input
          id="test-email"
          type="email"
          autoComplete="email"
          placeholder="test@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="test-password">Mot de passe</Label>
        <Input
          id="test-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="signin">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Connexion</TabsTrigger>
          <TabsTrigger value="signup">Créer un compte test</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="space-y-4 pt-2">
            {fields}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="space-y-4 pt-2">
            {fields}
            <Button type="submit" variant="outline" className="w-full" disabled={loading}>
              {loading ? "Création..." : "Créer le compte"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

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
