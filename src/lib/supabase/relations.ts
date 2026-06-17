/** Supabase peut renvoyer une relation comme objet ou tableau selon la requête */
export function relationName(
  relation: { name: string } | { name: string }[] | null | undefined
): string {
  if (!relation) return "";
  if (Array.isArray(relation)) return relation[0]?.name ?? "";
  return relation.name ?? "";
}
