/**
 * Calculate baby age in months from birthdate
 */
export function getBabyAgeInMonths(birthdate: string | null): number {
  if (!birthdate) return 6

  const birth = new Date(birthdate)
  const today = new Date()

  const yearDiff = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  let months = yearDiff * 12 + monthDiff

  // Adjust if we haven't reached the birth day this month yet
  if (today.getDate() < birth.getDate()) {
    months--
  }

  return Math.max(0, months)
}

/**
 * Get baby age as a formatted string
 */
export function formatBabyAge(birthdate: string | null): string {
  if (!birthdate) return 'возраст неизвестен'

  const totalMonths = getBabyAgeInMonths(birthdate)

  if (totalMonths < 1) {
    const birth = new Date(birthdate)
    const today = new Date()
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    return formatDays(days)
  }

  if (totalMonths < 12) {
    const birth = new Date(birthdate)
    const today = new Date()
    const birth_same_month = new Date(today.getFullYear(), today.getMonth(), birth.getDate())
    const days = Math.floor((today.getTime() - birth_same_month.getTime()) / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return `${totalMonths} ${formatMonths(totalMonths)}`
    }
    return `${totalMonths} ${formatMonths(totalMonths)} и ${days} ${formatDays(days)}`
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (months === 0) {
    return `${years} ${formatYears(years)}`
  }
  return `${years} ${formatYears(years)} и ${months} ${formatMonths(months)}`
}

function formatDays(days: number): string {
  if (days % 100 >= 11 && days % 100 <= 19) return 'дней'
const last = days % 10
if (last === 1) return 'день'
if (last >= 2 && last <= 4) return 'дня'
return 'дней'
}

function formatMonths(months: number): string {
  if (months % 100 >= 11 && months % 100 <= 19) return 'месяцев'
  const last = months % 10
  if (last === 1) return 'месяц'
  if (last >= 2 && last <= 4) return 'месяца'
  return 'месяцев'
}

function formatYears(years: number): string {
  if (years % 100 >= 11 && years % 100 <= 19) return 'лет'
  const last = years % 10
  if (last === 1) return 'год'
  if (last >= 2 && last <= 4) return 'года'
  return 'лет'
}

/**
 * Get the Monday of the current week
 */
export function getMonday(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format date in Russian format: DD месяц YYYY
 */
export function formatDateRu(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Format date as short string: DD.MM
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
