"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { BookingRules, EmailDomainSettings } from "@/types/database";
import { updateEmailDomains } from "@/lib/actions/admin";
import { updateBookingRules } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminRulesForm({
  rules,
  emailDomains,
}: {
  rules: BookingRules;
  emailDomains: EmailDomainSettings;
}) {
  const [form, setForm] = useState(rules);
  const [domainsText, setDomainsText] = useState(emailDomains.domains.join("\n"));
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const rulesResult = await updateBookingRules(form);
      const domainsResult = await updateEmailDomains({
        domains: domainsText
          .split(/[\n,;]/)
          .map((d) => d.trim())
          .filter(Boolean),
      });
      if (rulesResult.error || domainsResult.error) {
        toast.error(rulesResult.error ?? domainsResult.error);
      } else {
        toast.success("Règles enregistrées.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="space-y-4 rounded-xl border p-6">
        <h3 className="font-semibold">Réservation</h3>
        <div className="space-y-2">
          <Label>Durée minimum (minutes)</Label>
          <Input
            type="number"
            value={form.min_duration_minutes}
            onChange={(e) =>
              setForm({ ...form, min_duration_minutes: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Durée maximum (heures)</Label>
          <Input
            type="number"
            value={form.max_duration_hours}
            onChange={(e) =>
              setForm({ ...form, max_duration_hours: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Délai minimum avant réservation (heures)</Label>
          <Input
            type="number"
            value={form.min_advance_hours}
            onChange={(e) =>
              setForm({ ...form, min_advance_hours: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Délai d&apos;annulation (heures)</Label>
          <Input
            type="number"
            value={form.cancellation_hours}
            onChange={(e) =>
              setForm({ ...form, cancellation_hours: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <h3 className="font-semibold">Domaines email autorisés</h3>
        <p className="text-sm text-muted-foreground">
          Un domaine par ligne (ex. cite.fr). Laissez vide pour autoriser tous les domaines.
        </p>
        <Textarea
          rows={4}
          value={domainsText}
          onChange={(e) => setDomainsText(e.target.value)}
          placeholder="cite.fr"
        />
      </div>

      <Button type="submit" disabled={pending}>
        Enregistrer
      </Button>
    </form>
  );
}
