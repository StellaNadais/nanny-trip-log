const KEY = 'nanny-shift-punctuality-v1'

export function loadShiftEntries() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveShiftEntries(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    /* ignore */
  }
}
