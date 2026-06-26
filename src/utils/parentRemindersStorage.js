const KEY = 'nanny-parent-reminders-v1'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadParentReminders() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveParentReminders(reminders) {
  try {
    localStorage.setItem(KEY, JSON.stringify(reminders))
  } catch {
    /* ignore */
  }
}

/**
 * @param {{ bookingId: string, dateISO: string, text: string, childName?: string }} payload
 */
export function createParentReminder(payload) {
  const text = String(payload.text || '').trim()
  if (!text || !payload.bookingId || !payload.dateISO) return null
  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    bookingId: payload.bookingId,
    dateISO: payload.dateISO,
    text,
    childName: String(payload.childName || '').trim(),
  }
}
