import { Link } from 'react-router-dom'
import NotesPunctualitySummary from '../components/NotesPunctualitySummary'

export default function InternalNotesPage() {
  return (
    <div className="page page--internal-notes">
      <header className="notes__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <h1 className="notes__title">
          Internal notes <span className="placeholder__code">(E)</span>
        </h1>
        <p className="muted notes__lede">
          A quick read on how punctual your shift logs have been this year.
        </p>
        <Link to="/shift" className="btn btn--primary notes__cta">
          Log a shift
        </Link>
      </header>

      <NotesPunctualitySummary />
    </div>
  )
}
