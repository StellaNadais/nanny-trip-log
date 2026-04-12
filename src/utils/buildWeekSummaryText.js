import { weekDaysFromMonday } from './dates'
import { loadState } from './storage'
import { loadKidJournalEntries } from './kidJournalStorage'

function indentBlock(text, spaces) {
  const pad = ' '.repeat(spaces)
  return String(text || '')
    .split('\n')
    .map((line) => pad + line)
    .join('\n')
}

/**
 * Plain-text export for the selected week: trip log days, journal, expenses, receipt block.
 * @param {{ weekMondayIso: string, weekLabel: string, receiptText: string }} opts
 */
export function buildWeekSummaryText({ weekMondayIso, weekLabel, receiptText }) {
  const monday = new Date(`${weekMondayIso}T12:00:00`)
  const trip = loadState() || {}
  const daysByIso = trip.daysByIso && typeof trip.daysByIso === 'object' ? trip.daysByIso : {}
  const weekMeta = trip.weekMeta && typeof trip.weekMeta === 'object' ? trip.weekMeta : {}
  const expenses = Array.isArray(trip.expenses) ? trip.expenses : []
  const journal = loadKidJournalEntries()

  const lines = []
  lines.push('****************************************')
  lines.push('*     NANNY — WEEK SUMMARY (EXPORT)    *')
  lines.push('****************************************')
  lines.push('')
  lines.push(`Week:           ${weekLabel}`)
  lines.push(`Monday (key):   ${weekMondayIso}`)
  lines.push(`Generated:      ${new Date().toLocaleString()}`)
  lines.push('')
  lines.push('- - - - - - - - - - - - - - - - - - - -')
  lines.push('TRIP LOG · week header (from saved log)')
  lines.push('- - - - - - - - - - - - - - - - - - - -')
  if (weekMeta.scheduleLine) lines.push(`Schedule line: ${weekMeta.scheduleLine}`)
  if (weekMeta.childrenNames) lines.push(`Children:      ${weekMeta.childrenNames}`)
  if (!weekMeta.scheduleLine && !weekMeta.childrenNames) {
    lines.push('(no schedule / children lines in trip log storage)')
  }
  lines.push('')
  lines.push('- - - - - - - - - - - - - - - - - - - -')
  lines.push('DAY BY DAY')
  lines.push('- - - - - - - - - - - - - - - - - - - -')

  const days = weekDaysFromMonday(monday)
  for (const { label, iso } of days) {
    const d = daysByIso[iso] || {}
    const tripLog = String(d.tripLog || '').trim()
    const dayNotes = String(d.notes || '').trim()
    const jrows = journal.filter((e) => e.dateISO === iso)

    lines.push('')
    lines.push(`>>> ${label}  ${iso}`)
    if (tripLog) {
      lines.push('    --- Trip log (outings) ---')
      lines.push(indentBlock(tripLog, 4))
    }
    if (dayNotes) {
      lines.push('    --- Trip log · day notes ---')
      lines.push(indentBlock(dayNotes, 4))
    }
    for (const e of jrows) {
      lines.push('    --- Kid journal ---')
      if (e.dayNotes) lines.push(indentBlock(e.dayNotes, 6))
      if (e.mealsText) lines.push(`      Meals: ${e.mealsText}`)
      const nap = [e.morningNap, e.afternoonNap].filter(Boolean).join(' · ')
      if (nap) lines.push(`      Naps: ${nap}`)
      if (e.pottyToday) lines.push(`      Potty/poop: ${e.pottyToday}`)
    }
    if (!tripLog && !dayNotes && jrows.length === 0) {
      lines.push('    (no trip log or journal for this date)')
    }
  }

  lines.push('')
  lines.push('- - - - - - - - - - - - - - - - - - - -')
  lines.push('TRIP LOG · expenses tab (all weeks, one list)')
  lines.push('- - - - - - - - - - - - - - - - - - - -')
  if (expenses.length === 0) {
    lines.push('(none recorded)')
  } else {
    for (const x of expenses) {
      lines.push(`  * ${x.label}: $${Number(x.amount).toFixed(2)}`)
    }
  }

  lines.push('')
  lines.push('========================================')
  lines.push('WEEKLY RECEIPT (wages + mileage + extras)')
  lines.push('========================================')
  lines.push(String(receiptText || '').trimEnd())
  lines.push('')
  lines.push('****************************************')
  lines.push('*              END OF FILE             *')
  lines.push('****************************************')

  return lines.join('\n')
}

export function weekSummaryFilename(weekMondayIso) {
  return `week-summary-${weekMondayIso}.txt`
}

export function downloadTextFile(filename, text) {
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
