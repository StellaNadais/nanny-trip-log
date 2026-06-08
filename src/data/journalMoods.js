/** @type {{ id: string, label: string, emoji: string }[]} */
export const JOURNAL_MOODS = [
  { id: 'rough', label: 'Rough', emoji: '😫' },
  { id: 'low', label: 'Low', emoji: '😕' },
  { id: 'ok', label: 'OK', emoji: '🙂' },
  { id: 'good', label: 'Good', emoji: '😊' },
  { id: 'great', label: 'Great', emoji: '🌟' },
]

export function journalMoodLabel(id) {
  if (!id) return ''
  return JOURNAL_MOODS.find((m) => m.id === id)?.label ?? ''
}

export function journalMoodDisplay(id) {
  const m = JOURNAL_MOODS.find((x) => x.id === id)
  if (!m) return ''
  return `${m.emoji} ${m.label}`
}
