import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
};

let config: NextConfig = nextConfig;

if (process.env.NEXT_PUBLIC_ENABLE_PWA === "true") {
  const withSerwistInit = require("@serwist/next").default as typeof import("@serwist/next").default;
  const revision =
    spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
    crypto.randomUUID();

  const withSerwist = withSerwistInit({
    swSrc: "src/sw.ts",
    swDest: "public/sw.js",
    disable: process.env.NODE_ENV === "development",
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
  });

  config = withSerwist(nextConfig);
}

export default config;
