import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

/** Centered popup shell shared by Today workspace panels. */
export default function TodayPanelModal({
  open,
  onClose,
  eyebrow,
  title,
  dateLabel,
  children,
  footer,
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="about-today-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="about-today-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="about-today-modal__sheet">
        <header className="about-today-modal__head">
          <div>
            {eyebrow ? <p className="about-today-modal__eyebrow">{eyebrow}</p> : null}
            <h2 id={titleId} className="about-today-modal__title">
              {title}
            </h2>
            {dateLabel ? <p className="about-today-modal__date muted">{dateLabel}</p> : null}
          </div>
          <button type="button" className="btn btn--ghost about-today-modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="about-today-modal__scroll">{children}</div>

        <footer className="about-today-modal__foot">
          {footer ?? (
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Done
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  )
}
