import { Link } from 'react-router-dom'
import NotesPunctualityFlip from '../components/NotesPunctualityFlip'

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
          Shift times you submit from <strong>Shift</strong> land here — flip the card like{' '}
          <strong>Schedule</strong> to see your year chart or the full log.
        </p>
        <Link to="/shift" className="btn btn--primary notes__cta">
          Log a shift
        </Link>
      </header>

      <NotesPunctualityFlip />
    </div>
  )
}
