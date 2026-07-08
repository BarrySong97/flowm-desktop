#!/usr/bin/env node
/**
 * @purpose One-command FlowM release automation.
 * @role    Bumps versions, commits, pushes main, tags, waits for CI, publishes the draft release.
 * @deps    Node built-ins plus external git/gh/pnpm commands.
 * @gotcha  The human/AI-authored release note must already be the first entry in ReleaseTimeline.tsx.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { execFileSync } from "node:child_process"

const REPO = env("FLOWM_RELEASE_REPO", "BarrySong97/flowm-desktop")
const OWNER = env("FLOWM_RELEASE_OWNER", "BarrySong97")
const MAIN_BRANCH = env("FLOWM_RELEASE_BRANCH", "main")
const NOTES_FILE = env(
  "FLOWM_RELEASE_NOTES_FILE",
  "apps/web/components/releases/ReleaseTimeline.tsx",
)
const VERSION_FILES = env("FLOWM_RELEASE_VERSION_FILES", [
  "package.json",
  "apps/desktop/package.json",
  "apps/web/package.json",
  "packages/cli/package.json",
])
const TAP_REPO = env("FLOWM_RELEASE_TAP_REPO", "")
const CASK_PATH = env("FLOWM_RELEASE_CASK_PATH", "Casks/flowm.rb")
const CASK_ASSET_NAME = env("FLOWM_RELEASE_DMG", "FlowM-${version}-arm64.dmg")
const NPM_PACKAGE = env("FLOWM_RELEASE_NPM_PACKAGE", "@barrysongdev4real/flowm-cli")
const NPM_PACKAGE_DIR = env("FLOWM_RELEASE_NPM_PACKAGE_DIR", "packages/cli/npm")

const args = process.argv.slice(2)
const version = args.find((arg) => !arg.startsWith("--"))
const flags = new Set(args.filter((arg) => arg.startsWith("--")))

const dryRun = flags.has("--dry-run")
const noPublish = flags.has("--no-publish")
const noCask = flags.has("--no-cask") || !TAP_REPO
const noNpm = flags.has("--no-npm")
const noWait = flags.has("--no-wait")
const noChecks = flags.has("--no-checks")

if (flags.has("--help") || flags.has("-h")) {
  usage()
  process.exit(0)
}

if (!version) {
  usage()
  process.exit(1)
}

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  fail(`Invalid version "${version}". Expected semver like 0.2.2.`)
}

const tag = `v${version}`
let originalGhUser = ""

main()

function main() {
  validateReleaseNotes(version)
  ensureBranch()
  ensureInitialWorktree()
  ensureTagDoesNotExist(tag)

  for (const file of VERSION_FILES) bumpPackageVersion(file, version)

  if (!noChecks) runQualityGates()

  mut("git", ["add", NOTES_FILE, ...VERSION_FILES])
  mut("git", ["commit", "-m", `chore(release): ${tag}`])
  mut("git", ["push", "origin", MAIN_BRANCH])
  mut("git", ["tag", tag])
  mut("git", ["push", "origin", tag])

  if (!noWait) {
    waitForReleaseWorkflow(tag)
  }

  if (!noPublish) {
    publishDraft(tag)
  }

  if (!noNpm) {
    publishNpmPackage(version)
  }

  if (!noCask) {
    updateHomebrewCask(version)
  } else if (!TAP_REPO) {
    info("Skipping Homebrew cask update: FLOWM_RELEASE_TAP_REPO is not configured.")
  }

  validateRemoteRelease(tag)
  validateNpmPackage(version)
  if (!noCask) validateCask(version)

  info(`Release pipeline finished for ${tag}.`)
}

function validateReleaseNotes(expectedVersion) {
  const text = readFileSync(NOTES_FILE, "utf8")
  const releaseData = text.slice(text.indexOf("export const RELEASES"))
  const versions = [...releaseData.matchAll(/version:\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  )
  if (versions[0] !== expectedVersion) {
    fail(
      `${NOTES_FILE} first release version is ${versions[0] ?? "missing"}, expected ${expectedVersion}.`,
    )
  }

  const latestMatch = releaseData.match(
    /version:\s*["']([^"']+)["'][\s\S]*?badge:\s*["']latest["']/,
  )
  if (!latestMatch || latestMatch[1] !== expectedVersion) {
    fail(`${NOTES_FILE} must move badge: "latest" to version ${expectedVersion}.`)
  }

  const latestCount = [...releaseData.matchAll(/badge:\s*["']latest["']/g)].length
  if (latestCount !== 1) {
    fail(`${NOTES_FILE} must contain exactly one badge: "latest" entry; found ${latestCount}.`)
  }
}

function ensureBranch() {
  const branch = sh("git", ["branch", "--show-current"])
  if (branch !== MAIN_BRANCH) {
    const message = `Current branch is ${branch || "(detached)"}, expected ${MAIN_BRANCH}.`
    if (dryRun) {
      info(`[dry-run] ${message}`)
      return
    }
    fail(message)
  }
}

function ensureInitialWorktree() {
  const changed = sh("git", ["status", "--short", "--untracked-files=all"])
    .split("\n")
    .filter(Boolean)
  const allowed = new Set([NOTES_FILE])
  const unexpected = changed.filter((line) => {
    const file = line.replace(/^[ MADRCU?!]{1,2}\s+/, "").trim()
    return !allowed.has(file)
  })
  if (unexpected.length > 0 && !dryRun) {
    fail(
      `Unexpected uncommitted files before release:\n${unexpected.join(
        "\n",
      )}\nOnly ${NOTES_FILE} should be dirty before running pnpm release.`,
    )
  }
  if (unexpected.length > 0) info(`[dry-run] Unexpected dirty files:\n${unexpected.join("\n")}`)
}

function ensureTagDoesNotExist(tagName) {
  const local = sh("git", ["tag", "--list", tagName])
  if (local) fail(`Local tag ${tagName} already exists.`)

  const remote = shAllowFailure("git", ["ls-remote", "--tags", "origin", tagName])
  if (remote) fail(`Remote tag ${tagName} already exists.`)
}

function bumpPackageVersion(file, nextVersion) {
  bumpFile(file, /("version"\s*:\s*")([^"]+)(")/, `$1${nextVersion}$3`)
}

function bumpFile(file, pattern, replacement) {
  const before = readFileSync(file, "utf8")
  if (!pattern.test(before)) fail(`Could not find version pattern in ${file}.`)
  const after = before.replace(pattern, replacement)
  if (after === before) {
    if (dryRun) {
      info(`[dry-run] no version change needed in ${file}`)
      return
    }
    fail(`No change produced for ${file}.`)
  }
  if (dryRun) {
    info(`[dry-run] update ${file}`)
    return
  }
  writeFileSync(file, after)
}

function waitForReleaseWorkflow(tagName) {
  info(`Waiting for GitHub Actions release workflow for ${tagName}...`)
  const runId = findReleaseRun(tagName)
  mut("gh", ["run", "watch", runId, "--repo", REPO, "--exit-status"])
}

function findReleaseRun(tagName) {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const id = shAllowFailure("gh", [
      "run",
      "list",
      "--repo",
      REPO,
      "--workflow",
      "Release",
      "--branch",
      tagName,
      "--limit",
      "1",
      "--json",
      "databaseId",
      "--jq",
      ".[0].databaseId // empty",
    ])
    if (id) return id
    info(`Waiting for release workflow to appear (${attempt}/30)...`)
    if (!dryRun) sleepSync(5000)
  }
  fail(`Could not find Release workflow run for ${tagName}.`)
}

function publishDraft(tagName) {
  originalGhUser = currentGhUser()
  try {
    switchGhUser(OWNER)
    mut("gh", ["release", "edit", tagName, "--repo", REPO, "--draft=false", "--latest"])
  } finally {
    if (originalGhUser && originalGhUser !== OWNER) switchGhUser(originalGhUser)
  }
}

function publishNpmPackage(nextVersion) {
  const existing = shAllowFailure("npm", ["view", `${NPM_PACKAGE}@${nextVersion}`, "version"])
  if (existing === nextVersion) {
    info(`Skipping npm publish: ${NPM_PACKAGE}@${nextVersion} already exists.`)
    return
  }

  mut("pnpm", ["-F", NPM_PACKAGE, "build"])
  mut("npm", ["publish", NPM_PACKAGE_DIR, "--access", "public"])
}

function updateHomebrewCask(nextVersion) {
  originalGhUser = originalGhUser || currentGhUser()
  const dir = mkdtempSync(join(tmpdir(), "flowm-tap-"))
  try {
    switchGhUser(OWNER)
    const assetName = CASK_ASSET_NAME.replace("${version}", nextVersion)
    const digest = releaseAssetDigest(`v${nextVersion}`, assetName)
    if (!digest) fail(`Could not find digest for GitHub release asset ${assetName}.`)

    mut("git", ["clone", `https://github.com/${TAP_REPO}.git`, dir])
    const caskFile = join(dir, CASK_PATH)
    if (!existsSync(caskFile)) fail(`Cask file not found: ${TAP_REPO}/${CASK_PATH}`)

    bumpCask(caskFile, nextVersion, digest)
    mut("git", ["-C", dir, "add", CASK_PATH])
    mut("git", ["-C", dir, "commit", "-m", `chore: update FlowM to ${nextVersion}`])
    mut("git", ["-C", dir, "push", "origin", "HEAD"])
  } finally {
    if (originalGhUser && originalGhUser !== OWNER) switchGhUser(originalGhUser)
    if (!dryRun) rmSync(dir, { recursive: true, force: true })
  }
}

function bumpCask(file, nextVersion, sha256) {
  let text = readFileSync(file, "utf8")
  text = text.replace(/^\s*version\s+"[^"]+"/m, `  version "${nextVersion}"`)
  text = text.replace(/^\s*sha256\s+"[^"]+"/m, `  sha256 "${sha256}"`)
  if (dryRun) {
    info(`[dry-run] update ${file}`)
    return
  }
  writeFileSync(file, text)
}

function runQualityGates() {
  mut("pnpm", ["check-docs"])
  mut("pnpm", ["format:check"])
  mut("pnpm", ["lint"])
  mut("pnpm", ["build"])
}

function releaseAssetDigest(tagName, assetName) {
  const output = sh("gh", [
    "api",
    `repos/${REPO}/releases/tags/${tagName}`,
    "--jq",
    `.assets[] | select(.name == "${assetName}") | .digest`,
  ])
  return output.replace(/^sha256:/, "")
}

function validateRemoteRelease(tagName) {
  if (noPublish || dryRun) return
  const remoteTag = sh("gh", [
    "release",
    "view",
    tagName,
    "--repo",
    REPO,
    "--json",
    "tagName,isLatest,isDraft",
    "--jq",
    "[.tagName, .isLatest, .isDraft] | @tsv",
  ])
  const [seenTag, isLatest, isDraft] = remoteTag.split("\t")
  if (seenTag !== tagName || isLatest !== "true" || isDraft !== "false") {
    fail(`Release validation failed: ${remoteTag}`)
  }
}

function validateNpmPackage(nextVersion) {
  if (noNpm || dryRun) return
  const published = sh("npm", ["view", `${NPM_PACKAGE}@${nextVersion}`, "version"])
  if (published !== nextVersion) {
    fail(`npm validation failed: ${NPM_PACKAGE}@${nextVersion} returned ${published || "missing"}.`)
  }
}

function validateCask(nextVersion) {
  if (dryRun) return
  const content = sh("gh", ["api", `repos/${TAP_REPO}/contents/${CASK_PATH}`, "--jq", ".content"])
  const decoded = Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8")
  if (!decoded.includes(`version "${nextVersion}"`)) {
    fail(`Cask validation failed: ${CASK_PATH} does not contain version ${nextVersion}.`)
  }
}

function currentGhUser() {
  return shAllowFailure("gh", ["api", "user", "--jq", ".login"])
}

function switchGhUser(user) {
  if (!user || dryRun) {
    if (user) info(`[dry-run] gh auth switch --user ${user}`)
    return
  }
  mut("gh", ["auth", "switch", "--user", user])
}

function sh(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
  } catch (error) {
    const stderr = error?.stderr?.toString()?.trim()
    fail(stderr || `${cmd} ${args.join(" ")} failed`)
  }
}

function shAllowFailure(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
  } catch {
    return ""
  }
}

function mut(cmd, args) {
  if (dryRun) {
    info(`[dry-run] ${cmd} ${args.join(" ")}`)
    return ""
  }
  return execFileSync(cmd, args, { encoding: "utf8", stdio: "inherit" })
}

function env(name, fallback) {
  const value = process.env[name]
  if (!value) return fallback
  if (Array.isArray(fallback)) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return value
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function usage() {
  process.stdout.write(`Usage: pnpm release <version> [flags]

Flags:
  --dry-run      Print write operations without changing files or remotes.
  --no-publish   Do not publish the draft GitHub Release.
  --no-cask      Skip Homebrew cask update.
  --no-npm       Skip publishing ${NPM_PACKAGE} to npm.
  --no-wait      Do not wait for GitHub Actions.
  --no-checks    Skip local check-docs/format/lint/build gates.

Before running:
  1. Add the new first entry in ${NOTES_FILE}.
  2. Move badge: "latest" to that new entry.
  3. Run on ${MAIN_BRANCH}: pnpm release <version>.
`)
}

function info(message) {
  process.stdout.write(`${message}\n`)
}

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}
