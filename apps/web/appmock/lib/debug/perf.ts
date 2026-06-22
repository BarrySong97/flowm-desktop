/**
 * @purpose No-op performance/debug helpers for the marketing app mock.
 * @role    Stubs the renderer's perf module so verbatim-copied pages compile without side effects.
 * @gotcha  Everything here is intentionally inert.
 */

export function flowmPerfLog(..._args: unknown[]): void {}

export function flowmPerfMeasure(..._args: unknown[]): void {}

export function usePagePerf(..._args: unknown[]): void {}

export function roundMs(value: number): number {
  return value
}

export function summarizeValue(value: unknown): unknown {
  return value
}

export function installQueryClientPerfLogger(): void {}
