import { useMemo } from 'react'
import NotesYearChart from './NotesYearChart'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { getInternalNotesStats } from '../utils/hubInternalNotesStats'
import { getYearPunctualitySummary } from '../utils/hubShiftYearChart'

/**
 * Simple punctuality view — score + year chart (no flip, no log list).
 */
export default function NotesPunctualitySummary() {
  const { entries, timeOffEntries } = useShiftPunctuality()
  const year = new Date().getFullYear()

  const summary = useMemo(() => getYearPunctualitySummary(entries, year), [entries, year])
  const stats = useMemo(
    () => getInternalNotesStats(entries, timeOffEntries),
    [entries, timeOffEntries]
  )

  return (
    <section className="notes-punctuality" aria-label={`Punctuality ${year}`}>
      <div className="notes-punctuality__hero">
        <div
          className="notes-punctuality__ring"
          data-tier={summary.tier}
          role="img"
          aria-label={
            summary.avgScore == null
              ? 'No punctuality score yet'
              : `${summary.avgScore} out of 100 punctuality score`
          }
        >
          <span className="notes-punctuality__score">
            {summary.avgScore == null ? '—' : summary.avgScore}
          </span>
          <span className="notes-punctuality__score-unit">/ 100</span>
        </div>
        <div className="notes-punctuality__meta">
          <p className="notes-punctuality__badge">{stats.badge}</p>
          <p className="notes-punctuality__line">{summary.line}</p>
          <p className="notes-punctuality__hint muted">
            Earlier arrival and end slots score higher — same choices as on Shift.
          </p>
        </div>
      </div>

      <div className="notes-punctuality__chart">
        <h2 className="notes-punctuality__chart-title">This year</h2>
        <NotesYearChart entries={entries} />
      </div>
    </section>
  )
}
