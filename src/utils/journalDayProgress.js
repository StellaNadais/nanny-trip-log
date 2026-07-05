import { toISODateLocal } from './dates'

/** Caregiver workday window (local time). */
const WORK_START_HOUR = 8
const WORK_END_HOUR = 17

/**
 * Progress through the workday (8 AM–5 PM local) for the given calendar date.
 * @returns {{ percent: number, status: 'past' | 'today' | 'future' | 'before' | 'after', label: string }}
 */
export function getJournalDayProgress(dateISO, now = new Date()) {
  if (!dateISO) {
    return { percent: 0, status: 'future', label: '' }
  }

  const todayIso = toISODateLocal(now)

  if (dateISO < todayIso) {
    return { percent: 100, status: 'past', label: 'Day complete (8 AM–5 PM)' }
  }

  if (dateISO > todayIso) {
    return { percent: 0, status: 'future', label: 'Not started yet' }
  }

  const start = new Date(`${dateISO}T${String(WORK_START_HOUR).padStart(2, '0')}:00:00`).getTime()
  const end = new Date(`${dateISO}T${String(WORK_END_HOUR).padStart(2, '0')}:00:00`).getTime()
  const span = end - start
  const t = now.getTime()

  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (t < start) {
    return {
      percent: 0,
      status: 'before',
      label: `${timeLabel} · starts 8 AM`,
    }
  }

  if (t >= end) {
    return {
      percent: 100,
      status: 'after',
      label: `${timeLabel} · day complete`,
    }
  }

  const percent =
    span > 0 ? Math.min(100, Math.max(0, Math.round(((t - start) / span) * 100))) : 0

  return {
    percent,
    status: 'today',
    label: `${timeLabel} · ${percent}% (8 AM–5 PM)`,
  }
}
