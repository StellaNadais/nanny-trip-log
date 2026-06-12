import { useEffect, useMemo } from 'react'
import { parseMealsToParts } from '../utils/parseMeals'
import { journalMoodDisplay } from '../data/journalMoods'
import { pottyDisplayLine } from '../utils/journalLittleBooks'

/**
 * Receipt-style journal popup with rainbow frame.
 */
export default function JournalDayReceiptModal({
  open,
  onClose,
  dateLabel,
  dayNotes,
  mealsText,
  nap,
  pottyTime,
  pottyNotes,
  wishes,
  mood,
  handwrittenPhotoDataUrl,
  forwardSmsHref,
  canForward = true,
  onBeforeShareAction,
}) {
  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  const mealParts = useMemo(() => parseMealsToParts(mealsText ?? ''), [mealsText])
  const showHandwrittenPhoto = Boolean(String(handwrittenPhotoDataUrl || '').trim())

  function handleTextParent() {
    onBeforeShareAction?.()
  }

  if (!open) return null

  return (
    <div
      className="journal-day-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-day-receipt-title"
    >
      <button type="button" className="journal-day-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="journal-day-modal__sheet">
        <div className="journal-day-modal__slip">
          <div className="journal-day-modal__rainbow-wrap">
            <div className="journal-day-modal__ticket">
              <div className="journal-day-modal__jagged journal-day-modal__jagged--top" aria-hidden />
              <div className="journal-day-modal__inner">
                <p className="journal-day-modal__title" id="journal-day-receipt-title">
                  KID JOURNAL
                </p>
                <p className="journal-day-modal__meta">{dateLabel}</p>
                <div className="journal-day-modal__rule" />
                <p className="journal-day-modal__section-hdr">Mood</p>
                <p className="journal-day-modal__body journal-day-modal__mood-line">
                  {journalMoodDisplay(mood) || '—'}
                </p>
                <div className="journal-day-modal__rule" />
                <p className="journal-day-modal__section-hdr">About today</p>
                <p className="journal-day-modal__body">
                  {(dayNotes || '').trim() ? dayNotes : '—'}
                </p>
                {showHandwrittenPhoto ? (
                  <div className="journal-day-modal__handwritten-wrap">
                    <p className="journal-day-modal__section-hdr journal-day-modal__section-hdr--handwritten">
                      Handwritten journal
                    </p>
                    <img
                      src={handwrittenPhotoDataUrl}
                      alt=""
                      className="journal-day-modal__handwritten-img"
                    />
                  </div>
                ) : null}
                <div className="journal-day-modal__rule" />
                <p className="journal-day-modal__section-hdr">Meals</p>
                {mealParts.length > 0 ? (
                  <p className="journal-day-modal__meals">
                    {mealParts.map((p, i) => (
                      <span key={`jdm-${i}`}>
                        {i > 0 ? ', ' : null}
                        <span style={{ color: p.color }}>{p.segment}</span>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="journal-day-modal__body muted">—</p>
                )}
                <div className="journal-day-modal__rule" />
                <p className="journal-day-modal__section-hdr">Nap</p>
                <p className="journal-day-modal__nap-line">{nap?.trim() || '—'}</p>
                <div className="journal-day-modal__rule" />
                <p className="journal-day-modal__section-hdr">Potty</p>
                <p className="journal-day-modal__nap-line">
                  {pottyDisplayLine(pottyTime, pottyNotes) || '—'}
                </p>
                <div className="journal-day-modal__rule" />
                <p className="journal-day-modal__section-hdr">Wishes</p>
                <p className="journal-day-modal__body">{wishes?.trim() || '—'}</p>
                <div className="journal-day-modal__rule journal-day-modal__rule--bold" />
              </div>
              <div className="journal-day-modal__jagged journal-day-modal__jagged--bottom" aria-hidden />
            </div>
          </div>
        </div>
        <div className="journal-day-modal__actions">
          {canForward ? (
            <a
              href={forwardSmsHref}
              className="btn btn--primary journal-day-modal__text-parent"
              onClick={handleTextParent}
              aria-label="Open Messages with this day’s journal in the draft"
            >
              Text parent
            </a>
          ) : null}
          <button type="button" className="btn btn--ghost journal-day-modal__close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
