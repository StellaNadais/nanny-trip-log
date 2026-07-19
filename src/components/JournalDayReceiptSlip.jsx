import { useMemo } from 'react'
import { parseMealsToParts } from '../utils/parseMeals'
import { journalMoodDisplay } from '../data/journalMoods'
import { pottyDisplayLine } from '../utils/journalLittleBooks'

/** Receipt slip body — used in About today preview and standalone modal. */
export default function JournalDayReceiptSlip({
  dateLabel,
  dayNotes,
  mealsText,
  nap,
  pottyTime,
  pottyNotes,
  wishes,
  mood,
  handwrittenPhotoDataUrl,
  titleId,
  embedded = false,
}) {
  const mealParts = useMemo(() => parseMealsToParts(mealsText ?? ''), [mealsText])
  const showHandwrittenPhoto = Boolean(String(handwrittenPhotoDataUrl || '').trim())

  return (
    <div className={`journal-day-modal__slip${embedded ? ' journal-day-modal__slip--embedded' : ''}`}>
      <div className="journal-day-modal__rainbow-wrap">
        <div className="journal-day-modal__ticket">
          <div className="journal-day-modal__jagged journal-day-modal__jagged--top" aria-hidden />
          <div className="journal-day-modal__inner">
            <p className="journal-day-modal__title" id={titleId}>
              TODAY
            </p>
            <p className="journal-day-modal__meta">{dateLabel}</p>
            <div className="journal-day-modal__rule" />
            <p className="journal-day-modal__section-hdr">Mood</p>
            <p className="journal-day-modal__body journal-day-modal__mood-line">
              {journalMoodDisplay(mood) || '—'}
            </p>
            <div className="journal-day-modal__rule" />
            <p className="journal-day-modal__section-hdr">About today</p>
            <p className="journal-day-modal__body">{(dayNotes || '').trim() ? dayNotes : '—'}</p>
            {showHandwrittenPhoto ? (
              <div className="journal-day-modal__handwritten-wrap">
                <p className="journal-day-modal__section-hdr journal-day-modal__section-hdr--handwritten">
                  Handwritten journal
                </p>
                <img src={handwrittenPhotoDataUrl} alt="" className="journal-day-modal__handwritten-img" />
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
            <p className="journal-day-modal__section-hdr">Wishes + song requests</p>
            <p className="journal-day-modal__body">{wishes?.trim() || '—'}</p>
            <div className="journal-day-modal__rule journal-day-modal__rule--bold" />
          </div>
          <div className="journal-day-modal__jagged journal-day-modal__jagged--bottom" aria-hidden />
        </div>
      </div>
    </div>
  )
}
