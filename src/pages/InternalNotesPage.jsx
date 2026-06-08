import { Link } from 'react-router-dom'
import NotesPunctualitySummary from '../components/NotesPunctualitySummary'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'

export default function InternalNotesPage() {
  return (
    <div className="page page--internal-notes work-ui">
      <ToolWorkspaceHead
        eyebrow="Nanny hub workspace"
        title="Nanny hub"
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
