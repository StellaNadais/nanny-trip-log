import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'

function formatShiftDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatSavedAt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function InternalNotesPage() {
  const { entries } = useShiftPunctuality()

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const da = a.dateISO ?? ''
      const db = b.dateISO ?? ''
      if (da !== db) return db.localeCompare(da)
      return (b.savedAt ?? '').localeCompare(a.savedAt ?? '')
    })
  }, [entries])

  return (
    <div className="page page--internal-notes">
      <header className="notes__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <h1 className="notes__title">
          Internal notes <span className="placeholder__code">(D)</span>
        </h1>
        <p className="muted notes__lede">
          Shift times you submit from <strong>Shift</strong> land here so you can see how punctual you are.
        </p>
        <Link to="/shift" className="btn btn--primary notes__cta">
          Log a shift
        </Link>
      </header>

      <section className="notes__section" aria-labelledby="punctuality-heading">
        <h2 id="punctuality-heading" className="notes__section-title">
          Shift punctuality
        </h2>
        {sorted.length === 0 ? (
          <p className="muted">No shift times yet. Submit from the Shift card.</p>
        ) : (
          <ul className="notes__list">
            {sorted.map((row) => (
              <li key={row.id} className="notes__row">
                <div className="notes__row-main">
                  <span className="notes__date">{formatShiftDate(row.dateISO)}</span>
                  <span className="notes__times">
                    <span className="notes__tag">In {row.arrival}</span>
                    <span className="notes__tag">Out {row.end}</span>
                  </span>
                </div>
                <span className="notes__saved muted">Logged {formatSavedAt(row.savedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
