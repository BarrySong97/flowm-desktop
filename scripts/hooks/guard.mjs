#!/usr/bin/env node
/**
 * @purpose PreToolUse shell guard: blocks common destructive commands from AI tool hooks.
 * @role    Fast harness sensor shared by Claude Code and Codex hook configs.
 * @deps    Node stdin JSON with tool_input.command.
 * @gotcha  This is a guardrail, not a security boundary; tune RULES as the project learns.
 */

import { readFileSync } from "node:fs"

let payload = {}
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}")
} catch {
  // Keep payload empty on malformed hook input.
}

const cmd = payload?.tool_input?.command ?? ""

const RULES = [
  {
    re: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i,
    why: "Blocked rm -rf. Use an exact path and explicit human approval for destructive deletes.",
  },
  {
    re: /git\s+commit\b[^\n]*--no-verify/,
    why: "Blocked git commit --no-verify. Do not bypass pre-commit checks.",
  },
  {
    re: /git\s+push\b[^\n]*--force(?!-with-lease)/,
    why: "Blocked git push --force. Use --force-with-lease only when appropriate.",
  },
  {
    re: /\b(drop|truncate)\s+table\b/i,
    why: "Blocked destructive SQL.",
  },
  {
    re: /(^|[\s;&|])(rm|mv)\s[^\n]*\.env\b|>\s*\.env\b/,
    why: "Blocked deleting or overwriting .env files.",
  },
]

for (const rule of RULES) {
  if (rule.re.test(cmd)) {
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
