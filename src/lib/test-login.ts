/** Page /connexion-test : activée en local ou si NEXT_PUBLIC_ENABLE_TEST_LOGIN=true */
export function isTestLoginEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === "true";
}
