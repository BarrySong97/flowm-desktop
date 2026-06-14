/**
 * @purpose Parse command-palette style user input into structured renderer commands.
 * @role    Renderer utility for command workflows and tests.
 * @deps    String parsing helpers and command type definitions.
 * @gotcha  Keep parsing deterministic and free of side effects.
 */

export type ParsedCommand =
  | { kind: "refresh" }

export interface ParseResult {
  success: boolean
  command: ParsedCommand | null
  error?: string
}

export function parseFlowmCommand(raw: string): ParseResult {
  try {
    const input = raw.trim()
    if (input.length === 0) return { success: false, command: null, error: "Command is empty" }
    const verb = input.split(/\s+/)[0]?.toUpperCase()

    switch (verb) {
      case "REFRESH":
        return { success: true, command: { kind: "refresh" } }
      default:
        return { success: false, command: null, error: `Unknown command: ${input.split(/\s+/)[0]}` }
    }
  } catch (error) {
    return {
      success: false,
      command: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
