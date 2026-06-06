import type { TFunction } from "i18next"

export function columnLabel(t: TFunction, name: string): string {
  return t(`bqlColumn.${name}`, { defaultValue: name })
}
