/** Maps to Shift page arrival options — earlier slot = higher score. */
export const HUB_SHIFT_ARRIVAL_SCORE = Object.freeze({
  '8:00 AM': 100,
  '8:05 AM': 67,
  '8:10 AM': 34,
})

/** Maps to Shift page end options — earlier end = higher score. */
export const HUB_SHIFT_END_SCORE = Object.freeze({
  '5:00 PM': 100,
  '5:05 PM': 67,
  '5:10 PM': 34,
})

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'A', 'S', 'O', 'N', 'D']

export function entryPunctualityScore(e) {
  const a = HUB_SHIFT_ARRIVAL_SCORE[e?.arrival]
  const b = HUB_SHIFT_END_SCORE[e?.end]
  if (a != null && b != null) return Math.round((a + b) / 2)
  if (a != null) return Math.round(a * 0.92)
  if (b != null) return Math.round(b * 0.92)
  return null
}

/** Year rollup for Nanny hub — average slot score + day counts. */
export function getYearPunctualitySummary(entries, year = new Date().getFullYear()) {
  const y = String(year)
  let scoreSum = 0
  let scoreCount = 0
  let logged = 0
  let full = 0

  for (const e of entries || []) {
    if (!e?.dateISO?.startsWith(y)) continue
    logged++
    if (String(e.arrival || '').trim() && String(e.end || '').trim()) full++
    const sc = entryPunctualityScore(e)
    if (sc != null) {
      scoreSum += sc
      scoreCount++
    }
  }

  const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null
  let tier = 'empty'
  if (avgScore != null) {
    if (avgScore >= 85) tier = 'great'
    else if (avgScore >= 65) tier = 'ok'
    else tier = 'low'
  }

  const line =
    logged === 0
      ? 'Log from Shift to see your score.'
      : `${logged} day${logged === 1 ? '' : 's'} logged · ${full} with in & out`

  return { avgScore, logged, full, tier, line, year }
}

/**
 * Twelve-month model for the Nanny hub chart (one calendar year).
 * @param {{ dateISO?: string, arrival?: string, end?: string }[]} entries
 */
export function buildHubShiftYearChart(entries, year = new Date().getFullYear()) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    index: i,
    letter: MONTH_LETTERS[i],
    logged: 0,
    full: 0,
    scoreSum: 0,
    scoreCount: 0,
  }))

  for (const e of entries || []) {
    if (!e?.dateISO || e.dateISO.length < 10) continue
    const y = Number(e.dateISO.slice(0, 4))
    if (y !== year) continue
    const m = Number(e.dateISO.slice(5, 7)) - 1
    if (m < 0 || m > 11) continue
    months[m].logged++
    if (String(e.arrival || '').trim() && String(e.end || '').trim()) months[m].full++
    const sc = entryPunctualityScore(e)
    if (sc != null) {
      months[m].scoreSum += sc
      months[m].scoreCount++
    }
  }

  const maxLogged = Math.max(1, ...months.map((x) => x.logged))

  const monthsOut = months.map((x) => ({
    index: x.index,
    letter: x.letter,
    logged: x.logged,
    full: x.full,
    punctualityAvg: x.scoreCount > 0 ? Math.round(x.scoreSum / x.scoreCount) : null,
    barHLogged: x.logged / maxLogged,
    barHFull: x.full / maxLogged,
  }))

  const yearTotal = monthsOut.reduce((s, m) => s + m.logged, 0)

  return { year, maxLogged, months: monthsOut, yearTotal }
}
