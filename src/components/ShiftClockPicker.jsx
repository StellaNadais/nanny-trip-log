import { composeShiftLabel, shiftHourOptions, shiftMinuteOptions } from '../utils/shiftTimeWindow'

const HOURS = shiftHourOptions()
const MINUTES = shiftMinuteOptions()

export default function ShiftClockPicker({
  legend,
  ariaGroupLabel,
  hour,
  minute,
  ap,
  onChange,
  clockedLabel = '',
  onClock,
  clockButtonLabel,
  clockKind = 'arrival',
}) {
  const label = composeShiftLabel(hour, minute, ap)

  function patch(next) {
    onChange({
      hour,
      minute,
      ap,
      ...next,
    })
  }

  return (
    <fieldset className="shift__pick-field time-pick shift-clock-pick">
      <legend className="time-pick__legend">{legend}</legend>
      <div className="shift-clock-pick__row" role="group" aria-label={ariaGroupLabel}>
        <label className="shift-clock-pick__field">
          <span className="shift-clock-pick__field-label">Hour</span>
          <select
            className="input input--line shift-clock-pick__select"
            value={hour}
            onChange={(e) => patch({ hour: Number(e.target.value) })}
            aria-label={`${clockKind} hour`}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <span className="shift-clock-pick__colon" aria-hidden>
          :
        </span>
        <label className="shift-clock-pick__field">
          <span className="shift-clock-pick__field-label">Minute</span>
          <select
            className="input input--line shift-clock-pick__select"
            value={minute}
            onChange={(e) => patch({ minute: Number(e.target.value) })}
            aria-label={`${clockKind} minute`}
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </label>
        <div className="shift-clock-pick__ap" role="group" aria-label={`${clockKind} AM or PM`}>
          {['AM', 'PM'].map((mer) => (
            <button
              key={mer}
              type="button"
              className={`shift__time-circle shift-clock-pick__meridiem${ap === mer ? ' shift__time-circle--on' : ''}`}
              aria-pressed={ap === mer}
              onClick={() => patch({ ap: mer })}
            >
              <span className="shift__time-circle__clock">{mer}</span>
            </button>
          ))}
        </div>
      </div>
      {clockedLabel ? (
        <p className="shift__clocked" role="status">
          {clockKind === 'end' ? 'Clocked out' : 'Clocked in'} at <strong>{clockedLabel}</strong>
        </p>
      ) : null}
      <button
        type="button"
        className="btn btn--primary shift__submit-btn shift__submit-btn--live"
        onClick={() => onClock(label)}
        disabled={!label}
      >
        {clockButtonLabel}
      </button>
    </fieldset>
  )
}
