import { Link } from 'react-router-dom'

const TITLES = {
  events: { title: 'Events', code: 'D' },
}

export default function PlaceholderPage({ slug }) {
  const meta = TITLES[slug] ?? { title: 'Coming soon', code: '' }

  return (
    <div className="page page--placeholder">
      <header className="placeholder__head">
        <Link to="/schedule" className="page-back page-back--ghost">
          ← Schedule
        </Link>
        <h1 className="placeholder__title">
          {meta.title}
          {meta.code ? (
            <span className="placeholder__code"> ({meta.code})</span>
          ) : null}
        </h1>
        <p className="muted">This section is ready for you to build next.</p>
      </header>
      <Link to="/schedule" className="btn btn--primary placeholder__back">
        Back to tools
      </Link>
    </div>
  )
}
