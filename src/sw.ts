import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";
import type { RuntimeCaching } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const AUTH_PATHS = ["/connexion", "/auth/", "/mes-demandes", "/validation"];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );
}

/** Auth + API Supabase : toujours le réseau, jamais le cache SW */
const authAndApiBypass: RuntimeCaching[] = [
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && isAuthPath(pathname),
    handler: new NetworkOnly(),
  },
  {
    matcher: /^https:\/\/.*\.supabase\.co\/.*/i,
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [...authAndApiBypass, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          if (request.destination !== "document") return false;
          const pathname = new URL(request.url).pathname;
          // Ne pas rediriger vers hors-ligne pour l'auth (évite "no-response")
          if (isAuthPath(pathname)) return false;
          return true;
        },
      },
    ],
  },
});

serwist.addEventListeners();
