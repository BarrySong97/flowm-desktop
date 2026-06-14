/**
 * @purpose Provide account-name formatting and hierarchy helpers.
 * @role    Platform-light account utility for imports and display code.
 * @deps    String utilities only.
 * @gotcha  Do not read balances or infer assets from account names.
 */

import { ACCOUNT_TYPES, type AccountType } from "../types/beancount"

// Beancount account names are colon-delimited, with the leading component
// constrained to one of the five root types.
export const ACCOUNT_SEPARATOR = ":"

const ACCOUNT_TYPE_SET: ReadonlySet<string> = new Set(ACCOUNT_TYPES)

// Each component after the root must start with an uppercase letter or digit;
// remaining chars may be letters, digits, or hyphens. (Mirrors beancount's lexer.)
const COMPONENT_RE = /^[A-Z0-9][A-Za-z0-9-]*$/

export interface ParsedAccount {
  type: AccountType
  components: string[] // includes the type as components[0]
}

export function parseAccountName(name: string): ParsedAccount {
  const components = name.split(ACCOUNT_SEPARATOR)
  if (components.length < 2) {
    throw new Error(
      `Invalid account "${name}": must have at least a root type and one sub-component`,
    )
  }
  const [head, ...rest] = components
  if (!ACCOUNT_TYPE_SET.has(head)) {
    throw new Error(
      `Invalid account "${name}": root "${head}" is not one of ${ACCOUNT_TYPES.join("/")}`,
    )
  }
  for (const c of rest) {
    if (!COMPONENT_RE.test(c)) {
      throw new Error(
        `Invalid account "${name}": component "${c}" must start with uppercase letter or digit`,
      )
    }
  }
  return { type: head as AccountType, components }
}

// "Assets:Bank:Checking" → "Assets:Bank"; returns null for a root-only name.
export function parentAccountName(name: string): string | null {
  const idx = name.lastIndexOf(ACCOUNT_SEPARATOR)
  if (idx <= 0) return null
  return name.slice(0, idx)
}
