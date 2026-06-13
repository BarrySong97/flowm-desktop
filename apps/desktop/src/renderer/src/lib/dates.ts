export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayKey(): string {
  return dateKey(new Date())
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function addMonths(dateKeyValue: string, months: number): string {
  const next = new Date(dateKeyValue)
  next.setMonth(next.getMonth() + months)
  return dateKey(next)
}

export function monthStart(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`
}

export function monthCells(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const cells: (number | null)[] = []
  for (let index = 0; index < firstWeekday; index += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
  while (cells.length % 7) cells.push(null)
  return cells
}
