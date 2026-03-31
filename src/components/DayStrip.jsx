import { weekDaysFromMonday } from '../utils/dates'

export function DayStrip({ weekStart, selectedIso, onSelect }) {
  const days = weekDaysFromMonday(weekStart)

  return (
    <div className="day-strip" role="tablist" aria-label="Week days">
      {days.map(({ label, iso, date }) => {
        const active = iso === selectedIso
        return (
          <button
            key={iso}
            type="button"
            role="tab"
            aria-selected={active}
            className={`day-chip ${active ? 'day-chip--active' : ''}`}
            onClick={() => onSelect(iso)}
          >
            <span className="day-chip__label">{label}</span>
            <span className="day-chip__num">{date.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
