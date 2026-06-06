import type { ISODate } from "@flowm/shared"

export function addDays(date: ISODate, days: number): ISODate {
  const value = new Date(`${date}T00:00:00.000Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function addMonths(date: ISODate, months: number, dayOfMonth?: number): ISODate {
  const value = new Date(`${date}T00:00:00.000Z`)
  const day = dayOfMonth ?? value.getUTCDate()
  value.setUTCDate(1)
  value.setUTCMonth(value.getUTCMonth() + months)
  const lastDay = new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0),
  ).getUTCDate()
  value.setUTCDate(Math.min(day, lastDay))
  return value.toISOString().slice(0, 10)
}

export function addYears(date: ISODate, years: number): ISODate {
  return addMonths(date, years * 12)
}

export function periodOf(date: ISODate): string {
  return date.slice(0, 7)
}
