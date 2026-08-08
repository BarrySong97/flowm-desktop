/**
 * @purpose Bundle the Tauri Node sidecar while preserving its native SQLite addon.
 * @role    Server-side Vite build for the long-lived tRPC/Drizzle process.
 * @deps    Vite SSR bundling and the TypeScript sidecar entry point.
 * @gotcha  Bundle every JavaScript dependency; only better-sqlite3 stays external for its native binding.
 */

import { resolve } from "node:path"

import { defineConfig } from "vite"

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: resolve("dist-sidecar"),
    ssr: resolve("src/tauri-sidecar/index.ts"),
    target: "node22",
    rollupOptions: {
      external: ["better-sqlite3"],
      output: {
        entryFileNames: "index.cjs",
        format: "cjs",
      },
    },
  },
  ssr: {
    noExternal: true,
  },
})
