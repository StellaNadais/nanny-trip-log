import { useEffect, useMemo, useState } from 'react'
import { toISODateLocal } from '../utils/dates'
import { getJournalDaySkyStyle } from '../utils/journalDaySky'

/** Live page sky for kid journal — updates every minute when viewing today. */
export function useJournalDaySky(dateISO) {
  const [now, setNow] = useState(() => new Date())
  const isToday = dateISO === toISODateLocal(now)

  useEffect(() => {
    if (!isToday || !dateISO) return undefined
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [isToday, dateISO])

  return useMemo(() => getJournalDaySkyStyle(dateISO, now), [dateISO, now])
}
