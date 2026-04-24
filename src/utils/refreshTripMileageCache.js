import { formatWeekRange, startOfWeekMonday, toISODateLocal } from './dates'
import { computeWeekTripMileage } from './parseTripPlaces'
import { loadKidJournalEntries } from './kidJournalStorage'
import { loadReceiptSettings, saveReceiptSettings, notifyReceiptMileageUpdated } from './receiptStorage'
import { loadState } from './storage'

function weekKeyFromIso(iso) {
  if (!iso || typeof iso !== 'string') return null
  try {
    return toISODateLocal(startOfWeekMonday(new Date(iso + 'T12:00:00')))
  } catch {
    return null
  }
}

/**
 * Recomputes trip mileage for every week that appears in the receipt cache, trip log days,
 * journal entries, or today — then saves to receipt settings. Call after custom outing places change.
 */
export function refreshAllTripMileageCache() {
  const saved = loadState()
  const daysByIso =
    saved?.daysByIso && typeof saved.daysByIso === 'object' ? saved.daysByIso : {}
  const journalEntries = loadKidJournalEntries()
  const cur = loadReceiptSettings()

  const weekKeys = new Set()
  for (const k of Object.keys(cur.mileageByWeek || {})) {
    if (k) weekKeys.add(k)
  }
  for (const iso of Object.keys(daysByIso)) {
    const wk = weekKeyFromIso(iso)
    if (wk) weekKeys.add(wk)
  }
  for (const e of journalEntries) {
    const wk = weekKeyFromIso(e.dateISO)
    if (wk) weekKeys.add(wk)
  }
  const todayWk = weekKeyFromIso(toISODateLocal(new Date()))
  if (todayWk) weekKeys.add(todayWk)

  const nextMileage = { ...(cur.mileageByWeek || {}) }
  for (const weekKey of weekKeys) {
    const weekStart = startOfWeekMonday(new Date(weekKey + 'T12:00:00'))
    const { totalMiles, reimbursement, breakdown } = computeWeekTripMileage(
      weekStart,
      daysByIso,
      journalEntries
    )
    nextMileage[weekKey] = {
      totalMiles,
      reimbursement,
      breakdown,
      weekLabel: formatWeekRange(weekStart),
      updatedAt: Date.now(),
    }
  }

  saveReceiptSettings({ mileageByWeek: nextMileage })
  notifyReceiptMileageUpdated()
}
