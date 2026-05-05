import { bookingEndMs } from './bookingRange'
import { isWeeklyReceiptBusinessHours } from './receiptWindowMode'

function sortUpcoming(a, b) {
  const a0 = new Date(`${a.dateISO}T${a.careStart || '00:00'}:00`).getTime()
  const b0 = new Date(`${b.dateISO}T${b.careStart || '00:00'}:00`).getTime()
  if (a0 !== b0) return a0 - b0
  return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
}

export function nextAcceptedGigDateISO(bookings) {
  const now = Date.now()
  const list = [...(bookings || [])].filter(
    (b) => b.responseStatus === 'accepted' && b.dateISO && bookingEndMs(b) >= now
  )
  list.sort(sortUpcoming)
  return list[0]?.dateISO ?? null
}

/**
 * `/receipt` in business hours, else `/receipt?gigDate=…` when a day is known.
 * @param {object[]} bookings
 * @param {{ at?: Date, gigDateISO?: string }} [opts]
 */
export function receiptPagePath(bookings, opts = {}) {
  const at = opts.at ?? new Date()
  if (isWeeklyReceiptBusinessHours(at)) return '/receipt'
  const fromOpt = opts.gigDateISO
  if (fromOpt && /^\d{4}-\d{2}-\d{2}$/.test(fromOpt)) {
    return `/receipt?gigDate=${encodeURIComponent(fromOpt)}`
  }
  const iso = nextAcceptedGigDateISO(bookings)
  return iso ? `/receipt?gigDate=${encodeURIComponent(iso)}` : '/receipt'
}

export function receiptNavLabel(at = new Date()) {
  return isWeeklyReceiptBusinessHours(at) ? 'Weekly receipt' : 'Receipt'
}

export function receiptOpenLinkText(at = new Date()) {
  return isWeeklyReceiptBusinessHours(at) ? 'Open weekly receipt →' : 'Open receipt →'
}
