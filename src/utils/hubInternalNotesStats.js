/**
 * Summary line + badge for Nanny hub — shift days + PTO from provider state.
 * @param {{ dateISO?: string, arrival?: string, end?: string }[]} entries
 * @param {{ dateISO?: string }[]} timeOffEntries
 */
export function getInternalNotesStats(entries, timeOffEntries) {
  const days = entries?.length ?? 0
  const full =
    entries?.filter((e) => String(e?.arrival || '').trim() && String(e?.end || '').trim()).length ?? 0
  const pto = timeOffEntries?.length ?? 0

  if (days === 0) {
    return {
      line: 'Clock in from Shift — watch this fill up.',
      badge: 'Year view',
    }
  }

  const bits = [`${days} day${days === 1 ? '' : 's'} logged`]
  if (full > 0) {
    bits.push(`${full} with in & out`)
  }
  if (pto > 0) {
    bits.push(`${pto} PTO`)
  }

  let badge = 'Keep it up'
  if (days >= 20) badge = 'Legend status'
  else if (days >= 14) badge = 'All-star tracking'
  else if (days >= 7) badge = 'Solid streak'
  else if (days >= 3) badge = 'Nice momentum'
  else if (full === days && days > 0) badge = 'Perfect log book'

  return { line: bits.join(' · '), badge }
}
