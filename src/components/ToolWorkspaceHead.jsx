import { Link } from 'react-router-dom'

/** Schedule-aligned header for isolated tool pages. */
export default function ToolWorkspaceHead({
  eyebrow,
  title,
  lede,
  titleAside,
  children,
  showBack = true,
}) {
  return (
    <header className="tool-workspace-head schedule-workspace-head">
      {showBack ? (
        <Link to="/journal" className="page-back page-back--ghost">
          ← Tools
        </Link>
      ) : null}
      {eyebrow ? <p className="schedule-workspace-head__eyebrow">{eyebrow}</p> : null}
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
