import { useEffect, useMemo } from 'react'
import { parseMealsToParts } from '../utils/parseMeals'

const JOURNAL_ICON_TIP_FORWARD =
  'Open Messages with this day’s journal in the draft (same text as download).'
const JOURNAL_ICON_TIP_DOWNLOAD = 'Download this day’s journal as a .txt file.'

function IconForwardSms({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 14 20 9 15 4" />
      <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
    </svg>
  )
}

function IconDownload({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

/**
 * Receipt-style journal popup with rainbow frame.
 */
export default function JournalDayReceiptModal({
  open,
  onClose,
  dateLabel,
  dayNotes,
  mealsText,
  morningNap,
  afternoonNap,
  handwrittenPhotoDataUrl,
  onDownload,
  forwardSmsHref,
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
        <div className="journal-day-modal__rainbow-wrap">
          <div className="journal-day-modal__ticket">
            <div className="journal-day-modal__jagged journal-day-modal__jagged--top" aria-hidden />
            <div className="journal-day-modal__inner">
              <p className="journal-day-modal__kicker" aria-hidden>
                ********************************
              </p>
              <p className="journal-day-modal__title" id="journal-day-receipt-title">
                KID JOURNAL
              </p>
              <p className="journal-day-modal__sub">Journal</p>
              <p className="journal-day-modal__meta">{dateLabel}</p>
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
              <p className="journal-day-modal__section-hdr">Naps</p>
              <p className="journal-day-modal__nap-line">
                <span>AM</span> <span>{morningNap?.trim() || '—'}</span>
              </p>
              <p className="journal-day-modal__nap-line">
                <span>PM</span> <span>{afternoonNap?.trim() || '—'}</span>
              </p>
              <div className="journal-day-modal__rule journal-day-modal__rule--bold" />
              <p className="journal-day-modal__thanks">End of day slip</p>
              <div className="journal-day-modal__rule" />
            </div>
            <div className="journal-day-modal__jagged journal-day-modal__jagged--bottom" aria-hidden />
          </div>
        </div>
        <div className="journal-day-modal__actions">
          <div className="receipt__icon-row journal-day-modal__icon-row">
            <a
              href={forwardSmsHref}
              className="btn btn--ghost receipt__icon-btn"
              data-tooltip={JOURNAL_ICON_TIP_FORWARD}
              aria-label="Open Messages with this day’s journal in the draft"
              title={JOURNAL_ICON_TIP_FORWARD}
            >
              <IconForwardSms />
            </a>
            {onDownload ? (
              <button
                type="button"
                className="btn btn--ghost receipt__icon-btn"
                data-tooltip={JOURNAL_ICON_TIP_DOWNLOAD}
                onClick={onDownload}
                aria-label="Download journal as a text file"
                title={JOURNAL_ICON_TIP_DOWNLOAD}
              >
                <IconDownload />
              </button>
            ) : null}
          </div>
          <p className="muted journal-day-modal__sms-hint">
            Forward uses the same wording as the .txt file; photos are not attached.
          </p>
          <button type="button" className="btn btn--ghost journal-day-modal__close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
