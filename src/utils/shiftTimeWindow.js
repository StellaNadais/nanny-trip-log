import { toISODateLocal } from './dates'

/** Half-width of the allowed submit window (±5 minutes). */
export const SHIFT_SUBMIT_WINDOW_MS = 5 * 60 * 1000

/**
 * Parse labels like "8:00 AM" / "5:05 PM" into a local Date on dateISO (YYYY-MM-DD).
 * @returns {Date | null}
 */
export function parseShiftDateTime(dateISO, timeLabel) {
  if (!dateISO || !timeLabel) return null
  const t = String(timeLabel).trim().toUpperCase().replace(/\s+/g, ' ')
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = m[3]
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  const [y, mo, d] = dateISO.split('-').map(Number)
  if (!y || !mo || !d) return null
  return new Date(y, mo - 1, d, h, min, 0, 0)
}

export function isSameCalendarDay(dateISO, when = new Date()) {
  return dateISO === toISODateLocal(when)
}

/** True when `when` is within ±5 minutes of the chosen wall time on dateISO. */
export function isWithinShiftSubmitWindow(dateISO, timeLabel, when = new Date()) {
  const target = parseShiftDateTime(dateISO, timeLabel)
  if (!target || Number.isNaN(target.getTime())) return false
  return Math.abs(when.getTime() - target.getTime()) <= SHIFT_SUBMIT_WINDOW_MS
}

/**
 * Status for UI: 'inside' | 'before' | 'after' | 'invalid'
 * @returns {{ status: 'inside' | 'before' | 'after' | 'invalid', target: Date | null, opensAt: Date | null, closesAt: Date | null }}
 */
export function shiftTimeWindowStatus(dateISO, timeLabel, when = new Date()) {
  const target = parseShiftDateTime(dateISO, timeLabel)
  if (!target || Number.isNaN(target.getTime())) {
    return { status: 'invalid', target: null, opensAt: null, closesAt: null }
  }
  const t = when.getTime()
  const open = target.getTime() - SHIFT_SUBMIT_WINDOW_MS
  const close = target.getTime() + SHIFT_SUBMIT_WINDOW_MS
  if (t < open) return { status: 'before', target, opensAt: new Date(open), closesAt: new Date(close) }
  if (t > close) return { status: 'after', target, opensAt: new Date(open), closesAt: new Date(close) }
  return { status: 'inside', target, opensAt: new Date(open), closesAt: new Date(close) }
}

export function formatCountdownMs(ms) {
  if (ms <= 0) return '0:00'
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

/** 24h HH:MM → shift label e.g. "9:00 AM". */
export function hmToShiftLabel(hm) {
  if (!hm || typeof hm !== 'string') return ''
  const [h, m] = hm.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return ''
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** ±5 minute picker options around a requested HH:MM time. */
export function shiftPickerOptionsFromHm(hm) {
  if (!hm || typeof hm !== 'string') return []
  const [h, m] = hm.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return []
  const base = new Date(2000, 0, 1, h, m, 0, 0).getTime()
  return [-5, 0, 5].map((offsetMin) =>
    new Date(base + offsetMin * 60_000).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  )
}
