import { getBookingRules, getEmailDomainSettings } from "@/lib/data";
import { AdminRulesForm } from "@/components/admin/admin-rules-form";

export default async function AdminRulesPage() {
  const [rules, emailDomains] = await Promise.all([
    getBookingRules(),
    getEmailDomainSettings(),
  ]);

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Règles métier</h2>
      <AdminRulesForm rules={rules} emailDomains={emailDomains} />
    </section>
  );
}
