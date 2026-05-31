export function buildJournalDayExportText({
  dateISO,
  dateLabel,
  dayNotes,
  mealsText,
  morningNap,
  afternoonNap,
  handwrittenPhotoDataUrl,
  shoppingItems = [],
}) {
  const hasHandwrittenPhoto = Boolean(String(handwrittenPhotoDataUrl || '').trim())
  const shoppingLines =
    shoppingItems.length === 0
      ? ['(empty)']
      : shoppingItems.map((item) => `${item.done ? '[x]' : '[ ]'} ${item.text}`)
  const lines = [
    'KID JOURNAL',
    dateLabel,
    `Date (ISO): ${dateISO}`,
    '',
    '--- About today ---',
    String(dayNotes || '').trim() || '(empty)',
    ...(hasHandwrittenPhoto
      ? ['(Handwritten journal photo is saved in the app — not embedded in this file.)']
      : []),
    '',
    '--- Meals ---',
    String(mealsText || '').trim() || '(empty)',
    '',
    '--- Naps ---',
    `Morning: ${String(morningNap || '').trim() || '—'}`,
    `Afternoon: ${String(afternoonNap || '').trim() || '—'}`,
    '',
    '--- Shopping list (this week) ---',
    ...shoppingLines,
    '',
    '---',
    `Exported ${new Date().toLocaleString()}`,
  ]
  return lines.join('\n')
}

/** Cap body length so `sms:` URLs stay within common mobile limits. */
export const JOURNAL_SMS_BODY_MAX = 2800

export function buildJournalDaySmsHref(payload) {
  const raw = buildJournalDayExportText(payload)
  let body = String(raw || '').trim()
  if (body.length > JOURNAL_SMS_BODY_MAX) {
    body = `${body.slice(0, JOURNAL_SMS_BODY_MAX).trimEnd()}\n…(trimmed for text — open app for full journal)`
  }
  return `sms:?body=${encodeURIComponent(body)}`
}

export function journalDayFilename(dateISO) {
  return `journal-${dateISO || 'day'}.txt`
}

export function downloadJournalDayFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}
