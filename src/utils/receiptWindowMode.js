/**
 * When true, receipt flow is week-oriented (Mon–Fri business hours).
 * Outside this window (weeknights after hours, weekends), use gig-day receipt mode.
 *
 * Rule: local time, Monday (1)–Friday (5), 8:00–16:59 (8am through the 4pm hour;
 * 5:00pm and later counts as “after hours”, matching a typical 8–5 workday).
 */
export function isWeeklyReceiptBusinessHours(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return true
  const day = d.getDay()
  if (day === 0 || day === 6) return false
  const h = d.getHours()
  const m = d.getMinutes()
  if (h < 8) return false
  if (h > 16) return false
  if (h === 16 && m > 59) return false
  return true
}
