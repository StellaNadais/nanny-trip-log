import { useMemo } from 'react'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { getYearPunctualitySummary } from '../utils/hubShiftYearChart'

/** Simple punctuality — score ring and short summary only. */
export default function NotesPunctualitySummary() {
  const { entries } = useShiftPunctuality()
  const year = new Date().getFullYear()
  const summary = useMemo(() => getYearPunctualitySummary(entries, year), [entries, year])

  let tierLabel = 'No data yet'
  if (summary.tier === 'great') tierLabel = 'On time'
  else if (summary.tier === 'ok') tierLabel = 'Mostly on time'
  else if (summary.tier === 'low') tierLabel = 'Room to improve'

  return (
    <section className="notes-punctuality notes-punctuality--simple work-ui__panel" aria-label={`Punctuality ${year}`}>
      <div
        className="notes-punctuality__ring"
        data-tier={summary.tier}
        role="img"
        aria-label={
          summary.avgScore == null
            ? 'No punctuality score yet'
            : `${summary.avgScore} out of 100 — ${tierLabel}`
        }
      >
        <span className="notes-punctuality__score">
          {summary.avgScore == null ? '—' : summary.avgScore}
        </span>
        <span className="notes-punctuality__score-unit">/ 100</span>
      </div>
      <p className="notes-punctuality__tier">{tierLabel}</p>
      <p className="notes-punctuality__line">{summary.line}</p>
      <p className="notes-punctuality__hint muted">
        Based on arrival and end times you log on Shift. Earlier slots score higher.
      </p>
    </section>
  )
}
