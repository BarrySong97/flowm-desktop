import type { Amount } from "@flowm/shared"

interface ScaledDecimal {
  value: bigint
  scale: number
}

const DECIMAL_RE = /^([+-])?(\d+)(?:\.(\d+))?$/

function pow10(scale: number): bigint {
  return 10n ** BigInt(scale)
}

function parseDecimal(input: string): ScaledDecimal {
  const match = DECIMAL_RE.exec(input.trim())
  if (!match) throw new Error(`Invalid decimal: ${input}`)
  const [, sign, whole, fraction = ""] = match
  const digits = BigInt(`${whole}${fraction}`.replace(/^0+(?=\d)/, ""))
  return {
    value: (sign === "-" ? -1n : 1n) * digits,
    scale: fraction.length,
  }
}

function align(decimal: ScaledDecimal, scale: number): bigint {
  return decimal.value * pow10(scale - decimal.scale)
}

function formatDecimal(decimal: ScaledDecimal): string {
  const negative = decimal.value < 0n
  const abs = negative ? -decimal.value : decimal.value
  const raw = abs.toString().padStart(decimal.scale + 1, "0")
  const whole = raw.slice(0, raw.length - decimal.scale)
  const fraction = raw.slice(raw.length - decimal.scale)
  const body = decimal.scale === 0 ? whole : `${whole}.${fraction}`
  return `${negative ? "-" : ""}${body}`
}

function roundToScale(decimal: ScaledDecimal, scale: number): ScaledDecimal {
  if (decimal.scale <= scale) {
    return {
      value: decimal.value * pow10(scale - decimal.scale),
      scale,
    }
  }
  const divisor = pow10(decimal.scale - scale)
  const negative = decimal.value < 0n
  const abs = negative ? -decimal.value : decimal.value
  const rounded = (abs + divisor / 2n) / divisor
  return { value: negative ? -rounded : rounded, scale }
}

export function addDecimals(...values: string[]): string {
  const parsed = values.map(parseDecimal)
  const scale = Math.max(0, ...parsed.map((value) => value.scale))
  return formatDecimal({
    value: parsed.reduce((sum, value) => sum + align(value, scale), 0n),
    scale,
  })
}

export function subtractDecimals(left: string, right: string): string {
  return addDecimals(left, negateDecimal(right))
}

export function negateDecimal(value: string): string {
  const parsed = parseDecimal(value)
  return formatDecimal({ value: -parsed.value, scale: parsed.scale })
}

export function multiplyDecimals(
  left: string,
  right: string,
  scale = 2,
): string {
  const a = parseDecimal(left)
  const b = parseDecimal(right)
  return formatDecimal(
    roundToScale({ value: a.value * b.value, scale: a.scale + b.scale }, scale),
  )
}

export function compareDecimals(left: string, right: string): number {
  const a = parseDecimal(left)
  const b = parseDecimal(right)
  const scale = Math.max(a.scale, b.scale)
  const diff = align(a, scale) - align(b, scale)
  return diff === 0n ? 0 : diff > 0n ? 1 : -1
}

export function isZeroDecimal(value: string): boolean {
  return parseDecimal(value).value === 0n
}

export function toFixedDecimal(value: string, scale = 2): string {
  return formatDecimal(roundToScale(parseDecimal(value), scale))
}

export function splitAmountEvenly(total: string, parts: number): string[] {
  if (!Number.isInteger(parts) || parts <= 0) {
    throw new Error("parts must be a positive integer")
  }
  const cents = toMinorUnits(total)
  const each = cents / BigInt(parts)
  let remainder = cents % BigInt(parts)
  return Array.from({ length: parts }, () => {
    let value = each
    if (remainder > 0n) {
      value += 1n
      remainder -= 1n
    } else if (remainder < 0n) {
      value -= 1n
      remainder += 1n
    }
    return fromMinorUnits(value)
  })
}

export function toMinorUnits(value: string): bigint {
  return roundToScale(parseDecimal(value), 2).value
}

export function fromMinorUnits(value: bigint): string {
  return formatDecimal({ value, scale: 2 })
}

export function amount(number: string, currency: string): Amount {
  return { number: toFixedDecimal(number), currency }
}
