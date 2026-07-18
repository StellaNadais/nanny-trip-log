/** Workspace tile — opens a panel popup. Calendar-style text, optional icon. */
export default function TodaySpaceTile({
  icon,
  preview,
  hint,
  hoverPreview,
  onClick,
  cta = 'Open →',
}) {
  return (
    <button type="button" className="today-space-tile" onClick={onClick}>
      {icon ? (
        <span className="today-space-tile__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <p className="today-space-tile__preview">
        {preview || <span className="today-space-tile__hint muted">{hint}</span>}
      </p>
      {hoverPreview ? (
        <p className="today-space-tile__hover-preview" aria-hidden>
          {hoverPreview}
        </p>
      ) : null}
      <span className="today-space-tile__cta">{cta}</span>
    </button>
  )
}
