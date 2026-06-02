import { toISODateLocal } from './dates'

/**
 * How far through the calendar day (midnight–midnight local).
 * @returns {{ percent: number, status: 'past' | 'today' | 'future', label: string }}
 */
export function getJournalDayProgress(dateISO, now = new Date()) {
  if (!dateISO) {
    return { percent: 0, status: 'future', label: '' }
  }

  const todayIso = toISODateLocal(now)

  if (dateISO < todayIso) {
    return { percent: 100, status: 'past', label: 'Day complete' }
  }

  if (dateISO > todayIso) {
    return { percent: 0, status: 'future', label: 'Not started yet' }
  }

  const start = new Date(`${dateISO}T00:00:00`).getTime()
  const end = start + 86400000
  const t = now.getTime()
  const percent = Math.min(100, Math.max(0, Math.round(((t - start) / (end - start)) * 100)))

  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return {
    percent,
    status: 'today',
    label: `${timeLabel} · ${percent}% through the day`,
  }
}
