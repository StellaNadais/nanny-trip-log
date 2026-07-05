/**
 * Shared thank-you gradient shell for Today workspace popups.
 */
export function TodaySoftPanel({ className = '', titleId, eyebrow, title, meta, lede, children, footer }) {
  return (
    <section
      className={`soft-panel soft-panel--today-popup soft-panel--book-popup${className ? ` ${className}` : ''}`}
      aria-labelledby={titleId}
    >
      <div className="soft-panel__hero">
        {eyebrow ? <p className="soft-panel__eyebrow">{eyebrow}</p> : null}
        {title ? (
          <h2 id={titleId} className="soft-panel__title">
            {title}
          </h2>
        ) : null}
        {meta ? <p className="soft-panel__meta muted">{meta}</p> : null}
        {lede ? <p className="soft-panel__lede">{lede}</p> : null}
      </div>
      <div className="soft-panel__body soft-panel__body--today-popup">{children}</div>
      {footer ? <p className="soft-panel__footer">{footer}</p> : null}
    </section>
  )
}

export function TodaySoftSection({ title, titleId, children, className = '' }) {
  return (
    <section className={`today-soft-section${className ? ` ${className}` : ''}`} aria-labelledby={titleId}>
      {title ? (
        <div className="today-soft-section__head">
          <span className="today-soft-section__title" id={titleId}>
            {title}
          </span>
        </div>
      ) : null}
      <div className="today-soft-section__body">{children}</div>
    </section>
  )
}
