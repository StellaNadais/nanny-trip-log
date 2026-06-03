import { Link } from 'react-router-dom'

/** Schedule-aligned header for isolated tool pages. */
export default function ToolWorkspaceHead({
  code,
  eyebrow = 'Caregiver workspace',
  title,
  lede,
  children,
}) {
  return (
    <header className="tool-workspace-head schedule-workspace-head">
      <Link to="/hub" className="page-back page-back--ghost">
        ← Tools
      </Link>
      <p className="schedule-workspace-head__eyebrow">{eyebrow}</p>
      <h1 className="schedule__title">
        {title} <span className="placeholder__code">({code})</span>
      </h1>
      {lede ? <p className="schedule-workspace-head__sub muted">{lede}</p> : null}
      {children}
    </header>
  )
}
