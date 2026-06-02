import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Full-screen “Press to start” before the tool workspace (like Welcome → Schedule).
 */
export default function ToolStartGate({ title, code, hint, children }) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="page page--tool-start work-ui">
        <div className="page__badge" aria-hidden>
          {code}
        </div>
        <button
          type="button"
          className="tool-start__whole-tap"
          onClick={() => setStarted(true)}
          aria-label={`Press to start — open ${title}`}
        >
          <p className="tool-start__eyebrow">Caregiver tool</p>
          <h1 className="tool-start__title">{title}</h1>
          {hint ? <p className="tool-start__hint muted">{hint}</p> : null}
          <span className="tool-start__cta">Press to start</span>
        </button>
        <Link to="/schedule" className="tool-start__back page-back page-back--ghost">
          ← Schedule
        </Link>
      </div>
    )
  }

  return children
}
