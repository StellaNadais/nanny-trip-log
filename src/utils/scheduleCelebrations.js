import { MONTHLY_CELEBRATIONS } from '../data/monthlyCelebrations'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from './dates'

/** Do fun activities target: one week before the important date. */
export const ACTIVITY_PREP_DAYS_BEFORE = 7

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

export function activityPrepDateISO(celebrationDateISO) {
  return toISODateLocal(
    addDays(new Date(`${celebrationDateISO}T12:00:00`), -ACTIVITY_PREP_DAYS_BEFORE)
  )
}

function formatShortDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function withActivityPrep(c) {
  const activityByISO = activityPrepDateISO(c.dateISO)
  const activityWeekMon = startOfWeekMonday(new Date(`${activityByISO}T12:00:00`))
  const activityWeekStartISO = toISODateLocal(activityWeekMon)
  return {
    ...c,
    activityByISO,
    activityByLabel: formatShortDate(activityByISO),
    activityWeekStartISO,
    activityWeekLabel: formatWeekRange(activityWeekMon),
  }
}

/**
 * Important dates in this month that are still ahead (or today).
 * @param {number} year
 * @param {number} monthIndex 0–11
 * @param {string} [todayIso]
 */
export function upcomingCelebrationsInMonth(
  year,
  monthIndex,
  todayIso = toISODateLocal(new Date())
) {
  return celebrationsInMonth(year, monthIndex)
    .filter((c) => c.dateISO >= todayIso)
    .map(withActivityPrep)
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
 * Group upcoming celebrations by the week activities are due (one week before each date).
 * @param {number} year
 * @param {number} monthIndex
 * @param {string} [todayIso]
 */
export function celebrationsByActivityWeekInMonth(
  year,
  monthIndex,
  todayIso = toISODateLocal(new Date())
) {
  const items = upcomingCelebrationsInMonth(year, monthIndex, todayIso)
  return groupCelebrationsByActivityWeek(items)
}

/** @deprecated Use celebrationsByActivityWeekInMonth */
export function celebrationsByWeekInMonth(year, monthIndex, todayIso) {
  return celebrationsByActivityWeekInMonth(year, monthIndex, todayIso)
}

export function monthCelebrationsTitle(monthIndex, year = new Date().getFullYear()) {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

/** All celebrations in a month with prep-week metadata. */
export function celebrationsInMonthWithPrep(year, monthIndex) {
  return celebrationsInMonth(year, monthIndex).map(withActivityPrep)
}

function groupCelebrationsByActivityWeek(items) {
  const byWeek = new Map()

  for (const c of items) {
    if (!byWeek.has(c.activityWeekStartISO)) byWeek.set(c.activityWeekStartISO, [])
    byWeek.get(c.activityWeekStartISO).push(c)
  }

  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStartISO, celebrations]) => {
      const weekMon = new Date(`${weekStartISO}T12:00:00`)
      return {
        weekStartISO,
        weekLabel: formatWeekRange(weekMon),
        activityByISO: celebrations[0]?.activityByISO,
        celebrations: celebrations.sort((a, b) => a.activityByISO.localeCompare(b.activityByISO)),
      }
    })
}

/** Prep weeks for every celebration in the browsed month. */
export function celebrationsByActivityWeekForMonth(year, monthIndex) {
  return groupCelebrationsByActivityWeek(celebrationsInMonthWithPrep(year, monthIndex))
}
