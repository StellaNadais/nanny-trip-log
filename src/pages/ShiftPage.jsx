import { useEffect, useMemo, useState } from 'react'
import { DayStrip } from '../components/DayStrip'
import HoldConfirmControl from '../components/HoldConfirmControl'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { formatCountdownMs, shiftTimeWindowStatus } from '../utils/shiftTimeWindow'
import ShiftContractSection from '../components/ShiftContractSection'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

const ARRIVAL_TIMES = ['8:00 AM', '8:05 AM', '8:10 AM']
const END_TIMES = ['5:00 PM', '5:05 PM', '5:10 PM']

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

/** Splits "8:00 AM" → { clock: "8:00", ap: "AM" } */
function splitTimeLabel(full) {
  const parts = String(full).trim().split(/\s+/)
  if (parts.length >= 2) {
    return { clock: parts[0], ap: parts.slice(1).join(' ') }
  }
  return { clock: full, ap: '' }
}

export default function ShiftPage() {
  const { upsertShiftDay } = useShiftPunctuality()
  const [shiftWeekStart, setShiftWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )

  const weekKey = useMemo(() => toISODateLocal(shiftWeekStart), [shiftWeekStart])
  const shiftDate = useMemo(
    () => toISODateLocal(addDays(shiftWeekStart, dayOffset)),
    [shiftWeekStart, dayOffset]
  )

  const [arrival, setArrival] = useState('')
  const [end, setEnd] = useState('')
  const [flash, setFlash] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const clock = useMemo(() => {
    const now = new Date()
    const todayIso = toISODateLocal(now)
    const isShiftToday = shiftDate === todayIso
    const arrivalSt = arrival ? shiftTimeWindowStatus(shiftDate, arrival, now) : null
    const endSt = end ? shiftTimeWindowStatus(shiftDate, end, now) : null
    return {
      now,
      isShiftToday,
      arrivalSt,
      endSt,
      canLogArrival: isShiftToday && Boolean(arrival && arrivalSt?.status === 'inside'),
      canLogEnd: isShiftToday && Boolean(end && endSt?.status === 'inside'),
    }
  }, [tick, shiftDate, arrival, end])

  function shiftShiftWeek(delta) {
    setShiftWeekStart((w) => addDays(w, delta * 7))
  }

  function toggleArrival(t) {
    setArrival((prev) => (prev === t ? '' : t))
    setFlash('')
  }

  function toggleEnd(t) {
    setEnd((prev) => (prev === t ? '' : t))
    setFlash('')
  }

  function logArrival() {
    if (!clock.canLogArrival) return
    upsertShiftDay({ dateISO: shiftDate, arrival })
    setFlash('Arrival saved. Log end when you leave, inside its ±5 minute window.')
  }

  function logEnd() {
    if (!clock.canLogEnd) return
    upsertShiftDay({ dateISO: shiftDate, end })
    const pair = Boolean(arrival && end)
    setFlash(
      pair
        ? "Today's shift is logged."
        : 'End saved.'
    )
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
              label: 'Clock in',
              span: 2,
              hideHead: true,
              children: (
                <>
        <section
          className="journal-mood-bar journal-panel journal-panel--shift-log shift__card shift__card--log"
          aria-label="Log shift times"
        >
          <div className="journal-mood-bar__track journal-panel__body shift__form">
        <fieldset className="shift__pick-field time-pick">
          <legend className="time-pick__legend">Arrival</legend>
          <div className="shift__circle-row" role="group" aria-label="Arrival time">
            {ARRIVAL_TIMES.map((t) => {
              const { clock: clockPart, ap } = splitTimeLabel(t)
              const on = arrival === t
              const slotLive = on && clock.isShiftToday && clock.arrivalSt?.status === 'inside'
              const canHold = slotLive && clock.canLogArrival
              return (
                <HoldConfirmControl
                  key={t}
                  enabled={canHold}
                  onConfirm={logArrival}
                  onClick={() => toggleArrival(t)}
                  className={`shift__time-circle ${on ? 'shift__time-circle--on' : ''} ${slotLive ? 'shift__time-circle--live' : ''}`}
                  aria-pressed={on}
                  aria-label={
                    on
                      ? canHold
                        ? `Hold to log arrival ${t}, or tap to clear`
                        : `Clear arrival ${t}`
                      : `Select arrival ${t}`
                  }
                >
                  <span className="shift__time-circle__clock">{clockPart}</span>
                  {ap ? <span className="shift__time-circle__ap">{ap}</span> : null}
                </HoldConfirmControl>
              )
            })}
          </div>
          {arrival && clock.isShiftToday && clock.arrivalSt?.status === 'inside' ? (
            <p className="shift__window-hint shift__window-hint--ok" aria-live="polite">
              Press and hold to log arrival
            </p>
          ) : arrival && clock.isShiftToday && clock.arrivalSt?.status === 'before' ? (
            <p className="shift__window-hint muted" aria-live="polite">
              Unlocks in{' '}
              <strong className="shift__countdown">
                {formatCountdownMs(clock.arrivalSt.opensAt.getTime() - clock.now.getTime())}
              </strong>
            </p>
          ) : arrival && clock.isShiftToday && clock.arrivalSt?.status === 'after' ? (
            <p className="shift__window-hint muted" aria-live="polite">
              Window passed for {arrival}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="shift__pick-field time-pick">
          <legend className="time-pick__legend">End of shift</legend>
          <div className="shift__circle-row" role="group" aria-label="End of shift time">
            {END_TIMES.map((t) => {
              const { clock: clockPart, ap } = splitTimeLabel(t)
              const on = end === t
              const slotLive = on && clock.isShiftToday && clock.endSt?.status === 'inside'
              const canHold = slotLive && clock.canLogEnd
              return (
                <HoldConfirmControl
                  key={t}
                  enabled={canHold}
                  onConfirm={logEnd}
                  onClick={() => toggleEnd(t)}
                  className={`shift__time-circle ${on ? 'shift__time-circle--on' : ''} ${slotLive ? 'shift__time-circle--live' : ''}`}
                  aria-pressed={on}
                  aria-label={
                    on
                      ? canHold
                        ? `Hold to log end ${t}, or tap to clear`
                        : `Clear end ${t}`
                      : `Select end ${t}`
                  }
                >
                  <span className="shift__time-circle__clock">{clockPart}</span>
                  {ap ? <span className="shift__time-circle__ap">{ap}</span> : null}
                </HoldConfirmControl>
              )
            })}
          </div>
          {end && clock.isShiftToday && clock.endSt?.status === 'inside' ? (
            <p className="shift__window-hint shift__window-hint--ok" aria-live="polite">
              Press and hold to log end
            </p>
          ) : end && clock.isShiftToday && clock.endSt?.status === 'before' ? (
            <p className="shift__window-hint muted" aria-live="polite">
              Unlocks in{' '}
              <strong className="shift__countdown">
                {formatCountdownMs(clock.endSt.opensAt.getTime() - clock.now.getTime())}
              </strong>
            </p>
          ) : end && clock.isShiftToday && clock.endSt?.status === 'after' ? (
            <p className="shift__window-hint muted" aria-live="polite">
              Window passed for {end}
            </p>
          ) : null}
        </fieldset>

        {flash ? (
          <p
            className={`shift__flash ${
              flash.startsWith('Arrival') || flash.startsWith('End saved') || flash.startsWith('Today')
                ? 'shift__flash--ok'
                : ''
            }`}
            role="status"
          >
            {flash}
          </p>
        ) : null}

        <div className="shift__submit-row">
          <HoldConfirmControl
            enabled={clock.canLogArrival}
            onConfirm={logArrival}
            disabled={!clock.canLogArrival}
            className={`btn btn--primary shift__submit-btn shift__submit-btn--arrival ${clock.canLogArrival ? 'shift__submit-btn--live' : ''}`}
            aria-label="Press and hold to log arrival"
          >
            Log arrival
          </HoldConfirmControl>
          <HoldConfirmControl
            enabled={clock.canLogEnd}
            onConfirm={logEnd}
            disabled={!clock.canLogEnd}
            className={`btn btn--primary shift__submit-btn shift__submit-btn--end ${clock.canLogEnd ? 'shift__submit-btn--live' : ''}`}
            aria-label="Press and hold to log end"
          >
            Log end
          </HoldConfirmControl>
        </div>
          </div>
        </section>
                </>
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
