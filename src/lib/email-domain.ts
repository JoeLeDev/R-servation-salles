export type EmailDomainSettings = {
  domains: string[];
};

export function isEmailDomainAllowed(
  email: string,
  settings: EmailDomainSettings
): boolean {
  const domains = settings.domains
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  if (domains.length === 0) return true;

  const at = email.lastIndexOf("@");
  if (at < 0) return false;

  const domain = email.slice(at + 1).toLowerCase();
  return domains.includes(domain);
}

export function emailDomainError(settings: EmailDomainSettings): string {
  const list = settings.domains.join(", @");
  return `Seules les adresses @${list} sont autorisées.`;
}
