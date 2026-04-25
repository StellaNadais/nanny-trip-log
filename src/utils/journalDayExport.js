export function buildJournalDayExportText({
  dateISO,
  dateLabel,
  dayNotes,
  mealsText,
  morningNap,
  afternoonNap,
  handwrittenPhotoDataUrl,
}) {
  const hasHandwrittenPhoto = Boolean(String(handwrittenPhotoDataUrl || '').trim())
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
    '---',
    `Exported ${new Date().toLocaleString()}`,
  ]
  return lines.join('\n')
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
