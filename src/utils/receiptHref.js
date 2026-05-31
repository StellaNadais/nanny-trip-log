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
 * Hub with receipt popup open (`?receipt=open`). Gig date in query when after hours.
 * @param {object[]} bookings
 * @param {{ at?: Date, gigDateISO?: string }} [opts]
 */
export function receiptPagePath(bookings, opts = {}) {
  const at = opts.at ?? new Date()
  const params = new URLSearchParams()
  params.set('receipt', 'open')
  if (!isWeeklyReceiptBusinessHours(at)) {
    const fromOpt = opts.gigDateISO
    if (fromOpt && /^\d{4}-\d{2}-\d{2}$/.test(fromOpt)) {
      params.set('gigDate', fromOpt)
    } else {
      const iso = nextAcceptedGigDateISO(bookings)
      if (iso) params.set('gigDate', iso)
    }
  }
  return `/hub?${params.toString()}`
}

export function receiptNavLabel() {
  return 'Receipt'
}

export function receiptOpenLinkText() {
  return 'Open receipt →'
}
