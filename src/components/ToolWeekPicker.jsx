import { DayStrip } from './DayStrip'
import { formatWeekRange } from '../utils/dates'

export function formatToolWeekDayLabel(iso) {
  if (!iso) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Brutalist week card — prev/next, range, selected date, day strip.
 */
export default function ToolWeekPicker({
  weekStart,
  selectedIso,
  onSelect,
  onPrevWeek,
  onNextWeek,
  weekRangeLabel,
  selectedDateLabel,
  belowDate = null,
  className = '',
  prevLabel = '← Prev',
  nextLabel = 'Next →',
  ariaLabel = 'Pick a day',
}) {
  const range = weekRangeLabel ?? formatWeekRange(weekStart)
  const selected = selectedDateLabel ?? formatToolWeekDayLabel(selectedIso)

  return (
    <section className={`tool-week-picker ${className}`.trim()} aria-label={ariaLabel}>
      <div className="tool-week-picker__top">
        <div className="tool-week-picker__nav">
          <button type="button" className="tool-week-picker__nav-btn" onClick={onPrevWeek}>
            {prevLabel}
          </button>
          <p className="tool-week-picker__range" aria-live="polite">
            {range}
          </p>
          <button type="button" className="tool-week-picker__nav-btn" onClick={onNextWeek}>
            {nextLabel}
          </button>
        </div>
        <p className="tool-week-picker__selected" aria-live="polite">
          {selected}
        </p>
        {belowDate}
      </div>
      <DayStrip weekStart={weekStart} selectedIso={selectedIso} onSelect={onSelect} />
    </section>
  )
}
