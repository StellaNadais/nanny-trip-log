import { Link } from 'react-router-dom'
import NotesPunctualitySummary from '../components/NotesPunctualitySummary'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'

export default function InternalNotesPage() {
  return (
    <div className="page page--internal-notes work-ui">
      <div className="page__badge" aria-hidden>
        E
      </div>
      <ToolWorkspaceHead
        code="E"
        eyebrow="Internal notes workspace"
        title="Internal notes"
        lede="How punctual your shift logs look this year."
      >
        <Link to="/shift" className="btn btn--primary btn--work-primary notes__cta">
          Log a shift
        </Link>
      </ToolWorkspaceHead>

      <NotesPunctualitySummary />
    </div>
  )
}
