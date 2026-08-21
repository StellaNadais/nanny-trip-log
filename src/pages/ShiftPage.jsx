import { useMemo, useState } from 'react'
import { DayStrip } from '../components/DayStrip'
import ShiftClockPicker from '../components/ShiftClockPicker'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import {
  composeShiftLabel,
  defaultShiftParts,
  partsFromShiftLabel,
} from '../utils/shiftTimeWindow'
import ShiftContractSection from '../components/ShiftContractSection'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

function formatDayLabel(iso) {
  if (!iso) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function initialDayOffsetForWeek(mondayDate) {
  const monIso = toISODateLocal(mondayDate)
  const todayIso = toISODateLocal(new Date())
  const diff = Math.round(
    (new Date(todayIso + 'T12:00:00') - new Date(monIso + 'T12:00:00')) / 86400000
  )
  return Math.max(0, Math.min(6, diff))
}

function emptyClock(kind) {
  return { ...defaultShiftParts(kind), saved: '' }
}

function clockFromSaved(savedLabel, kind) {
  if (savedLabel) return { ...partsFromShiftLabel(savedLabel, kind), saved: savedLabel }
  return emptyClock(kind)
}

function ShiftClockBoard({ shiftDate, entries, upsertShiftDay }) {
  const saved = entries.find((e) => e.dateISO === shiftDate)
  const [arrival, setArrival] = useState(() => clockFromSaved(saved?.arrival, 'arrival'))
  const [end, setEnd] = useState(() => clockFromSaved(saved?.end, 'end'))
  const [flash, setFlash] = useState('')

  const arrivalLabel = composeShiftLabel(arrival.hour, arrival.minute, arrival.ap)
  const endLabel = composeShiftLabel(end.hour, end.minute, end.ap)

  function logArrival(label) {
    if (!label) return
    upsertShiftDay({ dateISO: shiftDate, arrival: label })
    setArrival((prev) => ({ ...prev, saved: label }))
    setFlash('Clocked in.')
  }

  function logEnd(label) {
    if (!label) return
    upsertShiftDay({ dateISO: shiftDate, end: label })
    setEnd((prev) => ({ ...prev, saved: label }))
    setFlash('Clocked out.')
  }

  return (
    <section
      className="journal-mood-bar journal-panel journal-panel--shift-log shift__card shift__card--log"
      aria-label="Clock in and out"
    >
      <div className="journal-mood-bar__track journal-panel__body shift__form">
        <p className="shift__form-lede muted">
          Pick the hour and minute you arrived or left for {formatDayLabel(shiftDate)}.
        </p>
        <ShiftClockPicker
          legend="Clock in"
          ariaGroupLabel="Clock-in time"
          hour={arrival.hour}
          minute={arrival.minute}
          ap={arrival.ap}
          onChange={(parts) => {
            setArrival((prev) => ({ ...prev, ...parts }))
            setFlash('')
          }}
          clockedLabel={arrival.saved}
          onClock={logArrival}
          clockButtonLabel={
            arrival.saved && arrival.saved !== arrivalLabel ? 'Update clock in' : 'Clock in'
          }
          clockKind="arrival"
        />
        <ShiftClockPicker
          legend="Clock out"
          ariaGroupLabel="Clock-out time"
          hour={end.hour}
          minute={end.minute}
          ap={end.ap}
          onChange={(parts) => {
            setEnd((prev) => ({ ...prev, ...parts }))
            setFlash('')
          }}
          clockedLabel={end.saved}
          onClock={logEnd}
          clockButtonLabel={end.saved && end.saved !== endLabel ? 'Update clock out' : 'Clock out'}
          clockKind="end"
        />
        {flash ? (
          <p className="shift__flash shift__flash--ok" role="status">
            {flash}
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default function ShiftPage() {
  const { entries, upsertShiftDay } = useShiftPunctuality()
  const [shiftWeekStart, setShiftWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )

  const weekKey = useMemo(() => toISODateLocal(shiftWeekStart), [shiftWeekStart])
  const shiftDate = useMemo(
    () => toISODateLocal(addDays(shiftWeekStart, dayOffset)),
    [shiftWeekStart, dayOffset]
  )

  function shiftShiftWeek(delta) {
    setShiftWeekStart((w) => addDays(w, delta * 7))
  }

  return (
    <div className="page page--shift page--kid-journal page--workspace work-ui">
      <div className="journal__layout shift__layout">
        <section className="journal__week-picker work-ui__panel" aria-label="Pick a day">
          <div className="journal__week-picker-top">
            <div className="trip-log__week-tools journal__week-tools">
              <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftShiftWeek(-1)}>
                ← Prev
              </button>
              <p className="journal__week-range" aria-live="polite">
                {formatWeekRange(shiftWeekStart)}
              </p>
              <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftShiftWeek(1)}>
                Next →
              </button>
            </div>
            <p className="journal__selected-day" aria-live="polite">
              {formatDayLabel(shiftDate)}
            </p>
          </div>
          <DayStrip
            weekStart={shiftWeekStart}
            selectedIso={shiftDate}
            onSelect={(iso) => {
              const a = new Date(weekKey + 'T12:00:00')
              const b = new Date(iso + 'T12:00:00')
              const diff = Math.round((b - a) / 86400000)
              setDayOffset(Math.max(0, Math.min(6, diff)))
            }}
          />
        </section>

        <WorkspaceTileBoard
          workspaceId="shift"
          tiles={[
            {
              id: 'clock',
              label: 'Clock',
              span: 2,
              hideHead: true,
              children: (
                <ShiftClockBoard
                  key={shiftDate}
                  shiftDate={shiftDate}
                  entries={entries}
                  upsertShiftDay={upsertShiftDay}
                />
              ),
            },
            {
              id: 'contract',
              label: 'Contract',
              span: 2,
              children: <ShiftContractSection selectedDateISO={shiftDate} />,
            },
          ]}
        />
      </div>
    </div>
  )
}
