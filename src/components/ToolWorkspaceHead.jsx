import { Link } from 'react-router-dom'

/** Schedule-aligned header for isolated tool pages. */
export default function ToolWorkspaceHead({
  eyebrow = 'Caregiver workspace',
  title,
  lede,
  titleAside,
  children,
}) {
  return (
    <header className="tool-workspace-head schedule-workspace-head">
      <Link to="/hub" className="page-back page-back--ghost">
        ← Tools
      </Link>
      <p className="schedule-workspace-head__eyebrow">{eyebrow}</p>
      {titleAside ? (
        <div className="schedule__title-row tool-workspace-head__title-row">
          <h1 className="schedule__title">{title}</h1>
          {titleAside}
        </div>
      ) : (
        <h1 className="schedule__title">{title}</h1>
      )}
      {lede ? <p className="schedule-workspace-head__sub muted">{lede}</p> : null}
      {children}
    </header>
  )
}
