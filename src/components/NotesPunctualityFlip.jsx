import { useMemo, useState } from 'react'
import NotesYearChart from './NotesYearChart'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { getInternalNotesStats } from '../utils/hubInternalNotesStats'

function formatShiftDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatSavedAt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Schedule-style flip: front = year chart + stats; back = punctuality log.
 */
export default function NotesPunctualityFlip() {
  const { entries, timeOffEntries } = useShiftPunctuality()
  const [showLog, setShowLog] = useState(false)

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const da = a.dateISO ?? ''
      const db = b.dateISO ?? ''
      if (da !== db) return db.localeCompare(da)
      return (b.savedAt ?? '').localeCompare(a.savedAt ?? '')
    })
  }, [entries])

  const stats = useMemo(
    () => getInternalNotesStats(entries, timeOffEntries),
    [entries, timeOffEntries]
  )

  const year = new Date().getFullYear()

  return (
    <section className="notes-flip" aria-label="Punctuality year view and log">
      <div className="notes-flip__scene">
        <div
          className={`notes-flip__inner${showLog ? ' notes-flip__inner--log' : ''}`}
          aria-live="polite"
        >
          <div
            className="notes-flip__face notes-flip__face--front notes-flip__card notes-flip__card--front"
            aria-hidden={showLog}
          >
            <div className="notes-flip__front-top">
              <p className="notes-flip__eyebrow">Your punctuality deck</p>
              <h2 className="notes-flip__front-title">This year at a glance</h2>
              <p className="notes-flip__front-year" aria-hidden>
                {year}
              </p>
            </div>
            <span className="notes-flip__pill">{stats.badge}</span>
            <p className="notes-flip__statline">{stats.line}</p>
            <div className="notes-flip__chart-shell">
              <NotesYearChart entries={entries} />
            </div>
            <button
              type="button"
              className="notes-flip__strip"
              onClick={() => setShowLog(true)}
              aria-label="Flip to shift punctuality log"
            >
              <span className="notes-flip__strip-text">Shift punctuality log</span>
              <span className="notes-flip__strip-hint" aria-hidden>
                Flip →
              </span>
            </button>
          </div>

          <div
            className="notes-flip__face notes-flip__face--back notes-flip__card notes-flip__card--back"
            aria-hidden={!showLog}
          >
            <div className="notes-flip__back-top">
              <button
                type="button"
                className="btn btn--ghost notes-flip__back-btn"
                onClick={() => setShowLog(false)}
              >
                ← Year view
              </button>
              <h2 className="notes-flip__back-heading">Shift punctuality</h2>
            </div>
            <div className="notes-flip__list-scroll">
              {sorted.length === 0 ? (
                <p className="muted notes-flip__list-empty">
                  No shift times yet. Submit from the <strong>Shift</strong> card — then flip back to
                  watch the year chart grow.
                </p>
              ) : (
                <ul className="notes__list notes__list--flip">
                  {sorted.map((row) => (
                    <li key={row.id} className="notes__row notes__row--flip">
                      <div className="notes__row-main">
                        <span className="notes__date">{formatShiftDate(row.dateISO)}</span>
                        <span className="notes__times">
                          {row.arrival ? <span className="notes__tag">In {row.arrival}</span> : null}
                          {row.end ? <span className="notes__tag">Out {row.end}</span> : null}
                          {!row.arrival && !row.end ? (
                            <span className="notes__tag notes__tag--muted">—</span>
                          ) : null}
                        </span>
                      </div>
                      <span className="notes__saved muted">Logged {formatSavedAt(row.savedAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
