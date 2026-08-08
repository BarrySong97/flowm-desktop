/**
 * @purpose Build the existing Flowm renderer for the parallel Tauri desktop shell.
 * @role    Standalone Vite configuration used by Tauri development and bundling.
 * @deps    React, Tailwind, TanStack Router generation, and renderer path aliases.
 * @gotcha  Keep renderer output separate from the Node sidecar bundle.
 */

import { resolve } from "node:path"

import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const rendererRoot = resolve("src/renderer")

export default defineConfig({
  root: rendererRoot,
  server: {
    host: "127.0.0.1",
    port: 54321,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": resolve("src/renderer/src"),
      "@renderer": resolve("src/renderer/src"),
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,
      routesDirectory: resolve("src/renderer/src/routes"),
      generatedRouteTree: resolve("src/renderer/src/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: resolve("dist"),
    emptyOutDir: true,
  },
})
