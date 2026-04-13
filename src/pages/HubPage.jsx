import { Link } from 'react-router-dom'

const CARDS = [
  { to: '/shift', label: 'Shift', code: 'A' },
  { to: '/journal', label: 'Kid Journal', code: 'B' },
  { to: '/outings', label: 'Outings', code: 'C' },
  { to: '/notes', label: 'Internal notes', code: 'D' },
  { to: '/events', label: 'Events', code: 'E', stacked: true },
]

export default function HubPage() {
  return (
    <div className="page page--hub">
      <div className="page__badge" aria-hidden>
        5
      </div>
      <header className="hub__head">
        <Link to="/schedule" className="page-back page-back--ghost">
          ← Schedule
        </Link>
        <h1 className="hub__title">Tools</h1>
      </header>

      <div className="hub__grid">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`hub-card ${c.stacked ? 'hub-card--stacked' : ''}`}
          >
            <span className="hub-card__label">{c.label}</span>
            <span className="hub-card__code">{c.code}</span>
          </Link>
        ))}
        <div className="hub-card hub-card--empty" aria-hidden />
      </div>

      <Link to="/receipt" className="hub__report">
        Weekly receipt
      </Link>
    </div>
  )
}
