/**
 * Parse parent-entered children line, e.g. "Harper (5), Poppy (3)".
 * Count is inferred from comma-separated entries — no separate "how many" field.
 */
export function parseChildrenOnGig(raw) {
  const childrenNames = String(raw || '').trim()
  if (!childrenNames) {
    return { valid: false, childrenNames: '', kidCount: 0 }
  }

  const parts = childrenNames
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const kidCount = parts.length
  return {
    valid: kidCount >= 1 && kidCount <= 20,
    childrenNames,
    kidCount,
  }
}

/** Display line for schedule lists and reminders. */
export function formatBookingChildrenLabel(booking) {
  const names = String(booking?.childrenNames || '').trim()
  if (names) return names
  const count = booking?.kidCount
  if (count != null && count > 0) {
    return `${count} ${count === 1 ? 'child' : 'children'}`
  }
  return null
}
