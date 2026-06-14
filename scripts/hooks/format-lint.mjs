#!/usr/bin/env node
/**
 * @purpose PostToolUse quality feedback hook: optionally runs single-file lint/format and returns output to the agent.
 * @role    Fast harness sensor shared by Claude Code and Codex hook configs.
 * @deps    Node child_process plus a project-specific LINT_CMD when enabled.
 * @gotcha  LINT_CMD is intentionally empty until the project chooses a deterministic single-file command.
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  // Keep payload empty on malformed hook input.
}

const file = payload?.tool_input?.file_path ?? "";
if (!file) process.exit(0);

// Example:
// const LINT_CMD = 'pnpm exec eslint "{{FILE}}"';
const LINT_CMD = "";

if (!LINT_CMD) process.exit(0);

try {
  execSync(LINT_CMD.replaceAll("{{FILE}}", file), { stdio: ["ignore", "pipe", "pipe"] });
  process.exit(0);
} catch (error) {
  const out = `${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
  if (out) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: `Lint/format report (${file}):\n${out}`,
        },
      }),
    );
  }
  process.exit(0);
}
