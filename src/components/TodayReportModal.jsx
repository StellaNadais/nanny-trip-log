import { useEffect } from 'react'

function detailValue(...values) {
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' · ')
}

/**
 * A calm, capture-ready version of a day's journal for sharing at pickup.
 */
export default function TodayReportModal({
  open,
  onClose,
  dateLabel,
  route,
  title,
  paragraph,
  mealsText,
  nap,
  pottyTime,
  pottyNotes,
  wishes,
}) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const potty = detailValue(pottyTime, pottyNotes)
  const hasDetails = Boolean(paragraph || mealsText || nap || potty || wishes || route.length)

  return (
    <div className="today-report-modal" role="dialog" aria-modal="true" aria-labelledby="today-report-title">
      <button type="button" className="today-report-modal__backdrop" aria-label="Close report" onClick={onClose} />
      <div className="today-report-modal__sheet">
        <button type="button" className="today-report-modal__close" onClick={onClose}>
          Close
        </button>
        <header className="today-report-modal__header">
          <p>Daily report</p>
          <time>{dateLabel}</time>
          <h1 id="today-report-title">{title || 'A lovely day together'}</h1>
          {route.length ? (
            <p className="today-report-modal__route">
              {route.map((place) => place.label).join(' · ')}
            </p>
          ) : null}
        </header>

        {paragraph ? <p className="today-report-modal__story">{paragraph}</p> : null}

        {hasDetails ? (
          <div className="today-report-modal__details">
            {mealsText ? (
              <section>
                <h2>Meals</h2>
                <p>{mealsText}</p>
              </section>
            ) : null}
            {nap ? (
              <section>
                <h2>Nap</h2>
                <p>{nap}</p>
              </section>
            ) : null}
            {potty ? (
              <section>
                <h2>Potty</h2>
                <p>{potty}</p>
              </section>
            ) : null}
            {wishes ? (
              <section className="today-report-modal__wishes">
                <h2>For next time</h2>
                <p>{wishes}</p>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="today-report-modal__empty">Today’s details will appear here once they’re added.</p>
        )}

        <footer className="today-report-modal__footer">carekidsmiles · care days, clearly shared</footer>
      </div>
    </div>
  )
}
