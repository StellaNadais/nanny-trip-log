import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { parseMealsToParts } from '../utils/parseMeals'
import { journalMoodDisplay } from '../data/journalMoods'
import { pottyDisplayLine } from '../utils/journalLittleBooks'

const HOLD_MS = 560
const MOVE_PX = 14

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
  onDownload,
  onBeforeShareAction,
  onHoldSheetOpen,
}) {
  const [holdMenuOpen, setHoldMenuOpen] = useState(false)
  const [touchUi, setTouchUi] = useState(false)
  const holdTimerRef = useRef(null)
  const holdOriginRef = useRef(null)

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const sync = () => setTouchUi(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!open) {
      setHoldMenuOpen(false)
      clearHoldTimer()
      holdOriginRef.current = null
    }
  }, [open, clearHoldTimer])

  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key !== 'Escape') return
      if (holdMenuOpen) {
        setHoldMenuOpen(false)
      } else {
        onClose()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose, holdMenuOpen])

  const mealParts = useMemo(() => parseMealsToParts(mealsText ?? ''), [mealsText])
  const showHandwrittenPhoto = Boolean(String(handwrittenPhotoDataUrl || '').trim())

  const onHoldZoneTouchStart = useCallback(
    (e) => {
      if (!touchUi || holdMenuOpen) return
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      holdOriginRef.current = { x: t.clientX, y: t.clientY }
      clearHoldTimer()
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null
        holdOriginRef.current = null
        try {
          navigator.vibrate?.(12)
        } catch {
          /* ignore */
        }
        onHoldSheetOpen?.()
        setHoldMenuOpen(true)
      }, HOLD_MS)
    },
    [touchUi, holdMenuOpen, clearHoldTimer, onHoldSheetOpen]
  )

  const onHoldZoneTouchMove = useCallback(
    (e) => {
      if (!touchUi || holdOriginRef.current == null || holdTimerRef.current == null) return
      const t = e.touches[0]
      const dx = t.clientX - holdOriginRef.current.x
      const dy = t.clientY - holdOriginRef.current.y
      if (dx * dx + dy * dy > MOVE_PX * MOVE_PX) {
        clearHoldTimer()
        holdOriginRef.current = null
      }
    },
    [touchUi, clearHoldTimer]
  )

  const endHoldGesture = useCallback(() => {
    clearHoldTimer()
    holdOriginRef.current = null
  }, [clearHoldTimer])

  function closeHoldMenu() {
    setHoldMenuOpen(false)
  }

  function handleDownloadPick() {
    onBeforeShareAction?.()
    onDownload?.()
    closeHoldMenu()
  }

  function handleTextPick() {
    onBeforeShareAction?.()
    closeHoldMenu()
  }

  function handleDesktopDownload() {
    onBeforeShareAction?.()
    onDownload?.()
  }

  function handleDesktopTextPick() {
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
        <div
          className="journal-day-modal__long-press-zone"
          onMouseEnter={() => onHoldSheetOpen?.()}
          onTouchStart={onHoldZoneTouchStart}
          onTouchMove={onHoldZoneTouchMove}
          onTouchEnd={endHoldGesture}
          onTouchCancel={endHoldGesture}
        >
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
          {touchUi ? null : (
            <div className="journal-day-modal__slip-hover-actions">
              {canForward ? (
                <a
                  href={forwardSmsHref}
                  className="btn btn--primary journal-day-modal__slip-hover-btn"
                  onClick={handleDesktopTextPick}
                  aria-label="Open Messages with this day’s journal in the draft"
                >
                  Text parent
                </a>
              ) : null}
              {onDownload ? (
                <button
                  type="button"
                  className="btn journal-day-modal__slip-hover-btn journal-day-modal__slip-hover-btn--secondary"
                  onClick={handleDesktopDownload}
                >
                  Download .txt
                </button>
              ) : null}
            </div>
          )}
        </div>
        <div className="journal-day-modal__actions">
          <button type="button" className="btn btn--ghost journal-day-modal__close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {holdMenuOpen ? (
        <>
          <button
            type="button"
            className="journal-day-modal__hold-scrim"
            aria-label="Dismiss"
            onClick={closeHoldMenu}
          />
          <div className="journal-day-modal__hold-panel" role="group" aria-label="Text or download">
            <div className="journal-day-modal__hold-panel-actions">
              {canForward ? (
                <a
                  href={forwardSmsHref}
                  className="btn btn--primary journal-day-modal__hold-action"
                  onClick={handleTextPick}
                >
                  Text parent
                </a>
              ) : null}
              {onDownload ? (
                <button type="button" className="btn journal-day-modal__hold-action" onClick={handleDownloadPick}>
                  Download .txt
                </button>
              ) : null}
            </div>
            <button type="button" className="btn btn--ghost journal-day-modal__hold-cancel" onClick={closeHoldMenu}>
              Cancel
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
