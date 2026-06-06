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
