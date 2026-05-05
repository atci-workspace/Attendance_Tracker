export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function toMonthDocId(uid: string, date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${uid}_${yyyy}_${mm}`
}

export function safeDay(day: number, year: number, month: number): boolean {
  if (!Number.isInteger(day) || day < 1 || day > 31) return false
  const candidate = new Date(year, month - 1, day)
  return candidate.getFullYear() === year && candidate.getMonth() === month - 1
}
