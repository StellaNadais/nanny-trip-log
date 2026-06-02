import { MONTHLY_CELEBRATIONS } from '../data/monthlyCelebrations'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from './dates'

/**
 * @param {number} year
 * @param {number} monthIndex 0–11
 */
export function celebrationsInMonth(year, monthIndex) {
  const month = monthIndex + 1
  return MONTHLY_CELEBRATIONS.filter((c) => c.month === month)
    .map((c) => {
      const start = new Date(year, monthIndex, c.day)
      const span = Math.max(1, c.spanDays ?? 1)
      const end = addDays(start, span - 1)
      return {
        ...c,
        dateISO: toISODateLocal(start),
        endISO: toISODateLocal(end),
        dateLabel: formatCelebrationRange(start, end, span),
      }
    })
    .sort((a, b) => a.day - b.day)
}

function formatCelebrationRange(start, end, span) {
  if (span <= 1) {
    return start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  const a = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const b = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${a} – ${b}`
}

/**
 * Group month celebrations by ISO week (Mon start) for the flip “upcoming weeks” view.
 * @param {number} year
 * @param {number} monthIndex
 * @param {string} [todayIso]
 */
export function celebrationsByWeekInMonth(year, monthIndex, todayIso = toISODateLocal(new Date())) {
  const items = celebrationsInMonth(year, monthIndex)
  const byWeek = new Map()

  for (const c of items) {
    const weekMon = toISODateLocal(startOfWeekMonday(new Date(`${c.dateISO}T12:00:00`)))
    if (!byWeek.has(weekMon)) byWeek.set(weekMon, [])
    byWeek.get(weekMon).push(c)
  }

  const monthStart = toISODateLocal(new Date(year, monthIndex, 1))
  const monthEnd = toISODateLocal(new Date(year, monthIndex + 1, 0))

  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStartISO, celebrations]) => {
      const weekMon = new Date(`${weekStartISO}T12:00:00`)
      const weekEndISO = toISODateLocal(addDays(weekMon, 6))
      const overlapsMonth = weekStartISO <= monthEnd && weekEndISO >= monthStart
      const isUpcoming = weekEndISO >= todayIso
      return {
        weekStartISO,
        weekLabel: formatWeekRange(weekMon),
        celebrations: celebrations.sort((a, b) => a.day - b.day),
        overlapsMonth,
        isUpcoming,
      }
    })
    .filter((w) => w.overlapsMonth && w.isUpcoming)
}

export function monthCelebrationsTitle(monthIndex) {
  return new Date(2000, monthIndex, 1).toLocaleDateString(undefined, { month: 'long' })
}
