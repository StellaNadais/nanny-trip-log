/** Square workspace tile — opens a Today panel popup. */
export default function TodaySpaceTile({ icon, preview, hint, count, onClick, cta = 'Open →' }) {
  return (
    <button type="button" className="today-space-tile" onClick={onClick}>
      <span className="today-space-tile__icon" aria-hidden>
        {icon}
      </span>
      {count > 0 ? (
        <span className="today-space-tile__count" aria-hidden>
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
      <p className="today-space-tile__preview">
        {preview || <span className="today-space-tile__hint muted">{hint}</span>}
      </p>
      <span className="today-space-tile__cta">{cta}</span>
    </button>
  )
}
