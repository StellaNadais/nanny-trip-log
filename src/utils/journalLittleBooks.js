/** Read potty log from a journal entry. */
export function pottyFromJournalEntry(entry) {
  if (!entry) return { pottyTime: '', pottyNotes: '' }
  const pottyTime = String(entry.pottyTime ?? '').trim()
  const pottyNotes = String(entry.pottyNotes ?? '').trim()
  if (pottyTime || pottyNotes) return { pottyTime, pottyNotes }
  const legacy = String(entry.potty ?? '').trim()
  if (!legacy) return { pottyTime: '', pottyNotes: '' }
  const dash = legacy.indexOf(' — ')
  if (dash >= 0) {
    return {
      pottyTime: legacy.slice(0, dash).trim(),
      pottyNotes: legacy.slice(dash + 3).trim(),
    }
  }
  return { pottyTime: '', pottyNotes: legacy }
}

export function pottyDisplayLine(pottyTime, pottyNotes) {
  const time = String(pottyTime ?? '').trim()
  const notes = String(pottyNotes ?? '').trim()
  if (time && notes) return `${time} — ${notes}`
  return time || notes || ''
}
