/** Read nap text from a journal entry (supports legacy AM/PM fields). */
export function napFromJournalEntry(entry) {
  if (!entry) return ''
  const nap = String(entry.nap ?? '').trim()
  if (nap) return nap
  const parts = [entry.morningNap, entry.afternoonNap]
    .map((s) => String(s ?? '').trim())
    .filter(Boolean)
  return parts.join(' · ')
}
