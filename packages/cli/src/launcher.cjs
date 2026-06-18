#!/usr/bin/env node
/**
 * @purpose Launch the Flowm CLI through Electron's Node runtime.
 * @role    Cross-platform workspace launcher that preserves the better-sqlite3 Electron ABI.
 * @deps    node:child_process, node:path, Electron from the desktop workspace, and root tsx.
 * @gotcha  Keep this CommonJS file small so package scripts work before TypeScript is loaded.
 */

const { spawnSync } = require("node:child_process")
const { existsSync } = require("node:fs")
const path = require("node:path")

const cliRoot = path.resolve(__dirname, "..")
const repoRoot = path.resolve(cliRoot, "../..")
const forwardedArgs = process.argv.slice(2)
if (forwardedArgs[0] === "--") forwardedArgs.shift()
const electronBin =
  process.platform === "win32"
    ? path.join(repoRoot, "apps/desktop/node_modules/.bin/electron.cmd")
    : path.join(repoRoot, "apps/desktop/node_modules/.bin/electron")
const tsxCli = path.join(cliRoot, "node_modules/tsx/dist/cli.mjs")
const entrypoint = path.join(cliRoot, "src/index.ts")

if (!existsSync(electronBin)) {
  console.error(`Electron runtime not found: ${electronBin}`)
  process.exit(1)
}

if (!existsSync(tsxCli)) {
  console.error(`tsx CLI not found: ${tsxCli}`)
  process.exit(1)
}

const result = spawnSync(electronBin, [tsxCli, entrypoint, ...forwardedArgs], {
  env: {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
  },
  stdio: "inherit",
  windowsHide: true,
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
