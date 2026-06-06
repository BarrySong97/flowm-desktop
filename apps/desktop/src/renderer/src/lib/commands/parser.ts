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
