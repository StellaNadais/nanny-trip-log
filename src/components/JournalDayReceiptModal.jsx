import { useEffect } from 'react'
import JournalDayReceiptSlip from './JournalDayReceiptSlip'

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
        <JournalDayReceiptSlip
          titleId="journal-day-receipt-title"
          dateLabel={dateLabel}
          dayNotes={dayNotes}
          mealsText={mealsText}
          nap={nap}
          pottyTime={pottyTime}
          pottyNotes={pottyNotes}
          wishes={wishes}
          mood={mood}
          handwrittenPhotoDataUrl={handwrittenPhotoDataUrl}
        />
        <div className="journal-day-modal__actions">
          {canForward ? (
            <a
              href={forwardSmsHref}
              className="btn btn--primary journal-day-modal__text-parent"
              onClick={() => onBeforeShareAction?.()}
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
