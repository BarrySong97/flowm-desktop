interface DecimalParts {
  sign: 1n | -1n
  digits: bigint
  scale: number
}

export interface ScaledDecimal {
  value: bigint
  scale: number
}

const DECIMAL_RE = /^([+-])?(\d+)(?:\.(\d+))?$/

function parseDecimal(input: string): DecimalParts {
  const trimmed = input.trim()
  const match = DECIMAL_RE.exec(trimmed)
  if (!match) {
    throw new Error(`Invalid decimal amount "${input}"`)
  }

  const [, rawSign, whole, fraction = ""] = match
  const digits = BigInt(`${whole}${fraction}`.replace(/^0+(?=\d)/, ""))
  return {
    sign: rawSign === "-" ? -1n : 1n,
    digits,
    scale: fraction.length,
  }
}

function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent)
}

export function decimalToScaled(input: string): ScaledDecimal {
  const parsed = parseDecimal(input)
  return {
    value: parsed.sign * parsed.digits,
    scale: parsed.scale,
  }
}

export function addScaled(a: ScaledDecimal, b: ScaledDecimal): ScaledDecimal {
  const scale = Math.max(a.scale, b.scale)
  return {
    value:
      a.value * pow10(scale - a.scale) + b.value * pow10(scale - b.scale),
    scale,
  }
}

export function multiplyDecimals(left: string, right: string): ScaledDecimal {
  const a = parseDecimal(left)
  const b = parseDecimal(right)
  return {
    value: a.sign * b.sign * a.digits * b.digits,
    scale: a.scale + b.scale,
  }
}

export function isZero(decimal: ScaledDecimal): boolean {
  return decimal.value === 0n
}
