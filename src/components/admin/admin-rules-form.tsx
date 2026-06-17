"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { BookingRules } from "@/types/database";
import { updateBookingRules } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminRulesForm({ rules }: { rules: BookingRules }) {
  const [form, setForm] = useState(rules);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateBookingRules(form);
      if (result.error) toast.error(result.error);
      else toast.success("Règles enregistrées.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-xl border p-6">
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
      <Button type="submit" disabled={pending}>
        Enregistrer les règles
      </Button>
    </form>
  );
}
