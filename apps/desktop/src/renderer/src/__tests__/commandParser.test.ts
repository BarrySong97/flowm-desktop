/**
 * @purpose Verify command parser.test behavior in the renderer test suite.
 * @role    Regression test for renderer utilities and shared UI behavior.
 * @deps    Vitest and the module under test.
 * @gotcha  Keep assertions deterministic and independent of live SQLite data.
 */

import { describe, expect, it } from "vitest"
import { parseFlowmCommand } from "../lib/commands/parser"

describe("parseFlowmCommand", () => {
  it("parses REFRESH command", () => {
    const result = parseFlowmCommand("REFRESH")
    expect(result.success).toBe(true)
    expect(result.command).toMatchObject({ kind: "refresh" })
  })

  it("rejects unsupported commands", () => {
    expect(parseFlowmCommand("HELLO").success).toBe(false)
    expect(parseFlowmCommand("").success).toBe(false)
  })
})
