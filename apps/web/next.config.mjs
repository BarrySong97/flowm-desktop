/**
 * @purpose Configure the Flowm marketing site (Next.js App Router).
 * @role    Build/runtime config for the apps/web package.
 * @deps    Next.js 15, Velite.
 * @gotcha  Linting runs through the workspace oxlint pass, not next lint.
 *          Velite watches content in development and performs one clean build
 *          for production so App Router can import generated blog data.
 */

import { join } from "node:path"

startVelite()

function startVelite() {
  if (process.env.VELITE_STARTED) return
  process.env.VELITE_STARTED = "1"
  const isDev = process.argv.includes("dev")
  void import("velite").then((velite) => velite.build({ watch: isDev, clean: !isDev }))
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // Pin file tracing to the monorepo root so the stray home-dir lockfile is ignored.
  outputFileTracingRoot: join(import.meta.dirname, "..", ".."),
  // @flowm/shared ships TypeScript source; let Next transpile it.
  transpilePackages: ["@flowm/shared"],
  eslint: {
    // The monorepo lints with oxlint at the root; skip Next's bundled ESLint.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // The verbatim-copied renderer files under appmock/ import via "@mock/*".
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mock": join(import.meta.dirname, "appmock"),
    }
    return config
  },
}

export default nextConfig
