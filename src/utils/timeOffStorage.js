const KEY = 'nanny-time-off-v1'

/** Max days per calendar year */
export const MAX_VACATION_DAYS_PER_YEAR = 10
export const MAX_SICK_DAYS_PER_YEAR = 5

export function yearFromIso(iso) {
  if (!iso) return new Date().getFullYear()
  return new Date(`${iso}T12:00:00`).getFullYear()
}

export function loadTimeOffEntries() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (e) =>
        e &&
        typeof e.id === 'string' &&
        typeof e.dateISO === 'string' &&
        (e.kind === 'vacation' || e.kind === 'sick')
    )
  } catch {
    return []
  }
}

export function saveTimeOffEntries(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    /* ignore */
  }
}

export function countByKindYear(entries, year, kind) {
  return entries.filter((e) => e.kind === kind && yearFromIso(e.dateISO) === year).length
}
