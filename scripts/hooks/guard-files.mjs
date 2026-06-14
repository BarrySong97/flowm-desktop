#!/usr/bin/env node
/**
 * @purpose PreToolUse file guard: blocks edits to secrets, keys, and lint configs.
 * @role    Complements the shell guard for file-edit tools.
 * @deps    Node stdin JSON with tool_input.file_path or patch input.
 * @gotcha  Codex apply_patch may not expose file_path, so patch scanning is best effort.
 */

import { readFileSync } from "node:fs"

let payload = {}
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}")
} catch {
  // Keep payload empty on malformed hook input.
}

const toolInput = payload?.tool_input ?? {}
const filePath = toolInput.file_path ?? toolInput.path ?? ""
const patch = typeof toolInput.input === "string" ? toolInput.input : ""
const targets = [filePath, patch].filter(Boolean)

const RULES = [
  { re: /(^|\/)\.env($|\.)/, why: "Blocked edits to .env files; handle secrets manually." },
  {
    re: /\.(pem|key|p12|keystore)$|(^|\/)id_rsa/,
    why: "Blocked edits to key or certificate files.",
  },
  {
    re: /(^|\/)\.(eslintrc|oxlintrc|oxfmtrc|prettierrc|stylelintrc)(\.|$)|(^|\/)(oxlint|oxfmt|biome)\.config\.[cm]?[jt]s$|(^|\/)biome\.jsonc?$/,
    why: "Blocked lint/format config edits; fix code instead of weakening checks.",
  },
]

for (const rule of RULES) {
  if (targets.some((target) => rule.re.test(target))) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: rule.why,
        },
      }),
    )
    process.exit(0)
  }
}

process.exit(0)
