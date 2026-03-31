const KEY = 'nanny-kid-journal-v1'

export function loadKidJournalEntries() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveKidJournalEntries(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    /* ignore */
  }
}
