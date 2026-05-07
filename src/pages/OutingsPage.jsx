import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayStrip } from '../components/DayStrip'
import {
  loadReceiptSettings,
  saveReceiptSettings,
  notifyReceiptMileageUpdated,
  RECEIPT_MILEAGE_EVENT,
} from '../utils/receiptStorage'
import { fileToCompressedDataUrl } from '../utils/receiptImage'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { MILE_RATE, PLACES } from '../data/tripPlaces'
import {
  loadOutingsPlaces,
  saveOutingsPlaces,
  notifyOutingsUpdated,
  OUTINGS_UPDATED_EVENT,
} from '../utils/outingsStorage'
import { refreshAllTripMileageCache } from '../utils/refreshTripMileageCache'
import { useBookings } from '../hooks/useBookings'
import { receiptOpenLinkText, receiptPagePath } from '../utils/receiptHref'

const MANUAL_CATEGORIES = [
  { id: 'parking_ticket', label: 'Parking ticket' },
  { id: 'parking_spot', label: 'Parking spot' },
  { id: 'ticket_entry', label: 'Ticket / entry' },
  { id: 'tolls', label: 'Tolls' },
  { id: 'fastrak', label: 'Fastrak' },
  { id: 'other', label: 'Other' },
]

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function categoryLabel(id) {
  return MANUAL_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

function emptyExtras() {
  return { photos: [], manualLines: [] }
}

function initialDayOffsetForWeek(mondayDate) {
  const monIso = toISODateLocal(mondayDate)
  const todayIso = toISODateLocal(new Date())
  const diff = Math.round(
    (new Date(todayIso + 'T12:00:00') - new Date(monIso + 'T12:00:00')) / 86400000
  )
  return Math.max(0, Math.min(6, diff))
}

export default function OutingsPage() {
  const { bookings } = useBookings()
  const [outingWeekStart, setOutingWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )
  const [extras, setExtras] = useState(emptyExtras)
  const [photoErr, setPhotoErr] = useState('')
  const [manualOpen, setManualOpen] = useState(false)
  const [manualCat, setManualCat] = useState('parking_ticket')
  const [manualAmt, setManualAmt] = useState('')
  const [manualNote, setManualNote] = useState('')
  const [mileageRev, setMileageRev] = useState(0)
  const [customPlaces, setCustomPlaces] = useState(() => loadOutingsPlaces())
  const [placeNickname, setPlaceNickname] = useState('')
  const [placeRoundTrip, setPlaceRoundTrip] = useState('')
  const [catalogTemplateId, setCatalogTemplateId] = useState('')
  const [placeFormErr, setPlaceFormErr] = useState('')
  const [placesDockOpen, setPlacesDockOpen] = useState(false)
  const fileRef = useRef(null)

  const weekKey = useMemo(() => toISODateLocal(outingWeekStart), [outingWeekStart])
  const dateISO = useMemo(
    () => toISODateLocal(addDays(outingWeekStart, dayOffset)),
    [outingWeekStart, dayOffset]
  )

  const receiptTo = useMemo(
    () => receiptPagePath(bookings, { gigDateISO: dateISO }),
    [bookings, dateISO]
  )
  const receiptLinkLabel = receiptOpenLinkText()

  const receiptWeekKey = weekKey

  const weekLabel = useMemo(() => formatWeekRange(outingWeekStart), [outingWeekStart])

  const outingsHeadingTip = useMemo(
    () =>
      `Mileage — tap Add places to save locations with round-trip miles from home (catalog quick-fill available). In journal or trip log, chain stops with “then” or + between names to share one trip. Text counts toward the Weekly receipt ($${MILE_RATE}/mi). Receipt extras are per week below.`,
    []
  )

  function shiftOutingWeek(delta) {
    setOutingWeekStart((w) => addDays(w, delta * 7))
  }

  useEffect(() => {
    const bump = () => setMileageRev((r) => r + 1)
    window.addEventListener(RECEIPT_MILEAGE_EVENT, bump)
    return () => window.removeEventListener(RECEIPT_MILEAGE_EVENT, bump)
  }, [])

  useEffect(() => {
    const sync = () => setCustomPlaces(loadOutingsPlaces())
    window.addEventListener(OUTINGS_UPDATED_EVENT, sync)
    return () => window.removeEventListener(OUTINGS_UPDATED_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!placesDockOpen) return
    const h = (e) => {
      if (e.key === 'Escape') setPlacesDockOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [placesDockOpen])

  const commitCustomPlaces = useCallback((next) => {
    saveOutingsPlaces(next)
    setCustomPlaces(next)
    notifyOutingsUpdated()
    refreshAllTripMileageCache()
  }, [])

  useEffect(() => {
    const s = loadReceiptSettings()
    const row = s.extrasByWeek?.[receiptWeekKey]
    setExtras(
      row && Array.isArray(row.photos) && Array.isArray(row.manualLines)
        ? { photos: row.photos, manualLines: row.manualLines }
        : emptyExtras()
    )
    setPhotoErr('')
  }, [receiptWeekKey, mileageRev])

  const commitExtras = useCallback(
    (updater) => {
      setExtras((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        const cur = loadReceiptSettings()
        saveReceiptSettings({
          extrasByWeek: { ...cur.extrasByWeek, [receiptWeekKey]: next },
        })
        notifyReceiptMileageUpdated()
        return next
      })
    },
    [receiptWeekKey]
  )

  const manualTotal = useMemo(
    () =>
      extras.manualLines.reduce((s, row) => s + (Number.isFinite(row.amount) ? row.amount : 0), 0),
    [extras.manualLines]
  )

  async function onPickPhoto(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setPhotoErr('')
    try {
      const dataUrl = await fileToCompressedDataUrl(f)
      commitExtras((prev) => {
        if (prev.photos.length >= 8) {
          setPhotoErr('Max 8 receipt photos per week.')
          return prev
        }
        setPhotoErr('')
        return { ...prev, photos: [...prev.photos, { id: uid(), dataUrl }] }
      })
    } catch {
      setPhotoErr('Could not add photo. Try a smaller image.')
    }
  }

  function removePhoto(id) {
    commitExtras((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }))
  }

  function addManualLine(e) {
    e.preventDefault()
    const amt = parseFloat(manualAmt)
    if (!Number.isFinite(amt) || amt < 0) return
    commitExtras((prev) => ({
      ...prev,
      manualLines: [
        ...prev.manualLines,
        {
          id: uid(),
          category: manualCat,
          note: manualNote.trim(),
          amount: Math.round(amt * 100) / 100,
        },
      ],
    }))
    setManualAmt('')
    setManualNote('')
    setManualOpen(false)
  }

  function removeManualLine(id) {
    commitExtras((prev) => ({
      ...prev,
      manualLines: prev.manualLines.filter((m) => m.id !== id),
    }))
  }

  function addCustomPlace(e) {
    e.preventDefault()
    const catalog = catalogTemplateId ? PLACES.find((x) => x.id === catalogTemplateId) : null
    const nick = placeNickname.trim()
    let label
    let nickname = ''
    if (catalog) {
      label = catalog.label
      nickname = nick
    } else {
      label = nick
    }
    const rt = parseFloat(String(placeRoundTrip).replace(',', '.'))
    if (!label) {
      setPlaceFormErr('Pick a catalog place or enter a name to match in your journal.')
      return
    }
    if (!Number.isFinite(rt) || rt < 0) {
      setPlaceFormErr('Enter round-trip miles (0 or more).')
      return
    }
    setPlaceFormErr('')
    commitCustomPlaces([
      ...customPlaces,
      {
        id: uid(),
        label,
        nickname,
        milesRoundTrip: Math.round(rt * 100) / 100,
      },
    ])
    setPlaceNickname('')
    setPlaceRoundTrip('')
    setCatalogTemplateId('')
  }

  function removeCustomPlace(id) {
    commitCustomPlaces(customPlaces.filter((p) => p.id !== id))
  }

  return (
    <div className="page page--outings">
      <header className="outings__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <div className="outings__title-row">
          <h1
            className="outings__title outings__title--hover-tip"
            id="outings-page-heading"
            aria-describedby="outings-page-intro"
            data-tooltip={outingsHeadingTip}
          >
            Outings <span className="placeholder__code">(C)</span>
          </h1>
          <div className={`outings-places-dock ${placesDockOpen ? 'outings-places-dock--open' : ''}`}>
            <button
              type="button"
              className="outings-places-dock__tab"
              onClick={() => setPlacesDockOpen((o) => !o)}
              aria-expanded={placesDockOpen}
              aria-controls="outings-places-panel"
            >
              {placesDockOpen ? (
                <span className="outings-places-dock__tab-x" aria-hidden>
                  ×
                </span>
              ) : (
                <>
                  <span className="outings-places-dock__tab-ico" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                    </svg>
                  </span>
                  <span className="outings-places-dock__tab-lbl">Add places</span>
                </>
              )}
            </button>
            <div
              className="outings-places-dock__panel"
              id="outings-places-panel"
              role="region"
              aria-hidden={!placesDockOpen}
              aria-labelledby="outings-places-heading"
            >
              <h2 id="outings-places-heading" className="outings-places-dock__title">
                Mileage locations
              </h2>
              <p className="muted outings__hint">
                Add round-trip miles from the family&apos;s home. Optional catalog row pre-fills distance. In journal or
                trip log, put <strong>then</strong> or <strong>+</strong> between saved place names when you drive{' '}
                A → B without returning home — mileage treats it as one trip: out from home, hops between stops (using
                each place&apos;s saved distance from home), then back home.
              </p>
              {customPlaces.length > 0 ? (
                <ul className="outings__places-list">
                  {customPlaces.map((p) => (
                    <li key={p.id} className="outings__place-row">
                      <div className="outings__place-main">
                        <strong className="outings__place-label">{p.label}</strong>
                        {p.nickname ? (
                          <span className="muted outings__place-nick">“{p.nickname}”</span>
                        ) : null}
                        <span className="outings__place-miles muted">{p.milesRoundTrip} mi round trip</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--ghost outings__place-remove"
                        onClick={() => removeCustomPlace(p.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted outings__places-empty">No custom locations yet — add one below.</p>
              )}
              <form className="outings__places-form" onSubmit={addCustomPlace}>
                <label className="field-block">
                  <span className="field-block__label">Quick fill from catalog (optional)</span>
                  <select
                    className="input input--line"
                    value={catalogTemplateId}
                    onChange={(e) => {
                      const id = e.target.value
                      setCatalogTemplateId(id)
                      if (!id) return
                      const p = PLACES.find((x) => x.id === id)
                      if (p) {
                        setPlaceRoundTrip(String(Math.round(p.milesOneWay * 2 * 100) / 100))
                        setPlaceNickname('')
                      }
                    }}
                  >
                    <option value="">— Choose a place —</option>
                    {PLACES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} · {p.milesOneWay * 2} mi round trip
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-block">
                  <span className="field-block__label">
                    {catalogTemplateId ? 'Also match nickname (optional)' : 'Place name (matches in journal)'}
                  </span>
                  <input
                    type="text"
                    className="input input--line"
                    value={placeNickname}
                    onChange={(e) => setPlaceNickname(e.target.value)}
                    placeholder={
                      catalogTemplateId
                        ? 'e.g. short phrase — extra word match'
                        : 'e.g. Golden Gate Park — must match what you type'
                    }
                    autoComplete="off"
                  />
                </label>
                <label className="field-block">
                  <span className="field-block__label">Round trip miles (from home)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    className="input input--line"
                    value={placeRoundTrip}
                    onChange={(e) => setPlaceRoundTrip(e.target.value)}
                    placeholder="e.g. 12"
                  />
                </label>
                {placeFormErr ? (
                  <p className="outings__places-err muted" role="status">
                    {placeFormErr}
                  </p>
                ) : null}
                <button type="submit" className="btn btn--primary">
                  Add location
                </button>
              </form>
            </div>
          </div>
        </div>
        {placesDockOpen ? (
          <button
            type="button"
            className="outings-places-dock__scrim"
            aria-label="Close mileage locations"
            onClick={() => setPlacesDockOpen(false)}
          />
        ) : null}
        <p id="outings-page-intro" className="sr-only">
          {outingsHeadingTip}
        </p>
      </header>

      <div className="journal__week-picker outings__week-picker">
        <div className="trip-log__week-tools">
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => shiftOutingWeek(-1)}
          >
            ← Previous week
          </button>
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => shiftOutingWeek(1)}
          >
            Next week →
          </button>
        </div>
        <p className="journal__week-range muted" aria-live="polite">
          {weekLabel}
        </p>
        <DayStrip
          weekStart={outingWeekStart}
          selectedIso={dateISO}
          onSelect={(iso) => {
            const a = new Date(weekKey + 'T12:00:00')
            const b = new Date(iso + 'T12:00:00')
            const diff = Math.round((b - a) / 86400000)
            setDayOffset(Math.max(0, Math.min(6, diff)))
          }}
        />
        <p className="muted outings__week-hint">
          Receipt extras apply to the <strong>whole week</strong> above (same calendar as Kid journal). The highlighted
          day is for navigation only.
        </p>
      </div>

      <section className="outings__section outings__section--receipt outings__section--solo" aria-labelledby="outings-receipt-heading">
        <h2 id="outings-receipt-heading" className="outings__section-title">
          Receipt extras (weekly)
        </h2>
        <p className="muted outings__hint">Applies to the same week on Weekly receipt totals.</p>

        <div className="receipt__capture-block outings__capture">
          <span className="field-block__label">Receipt photos</span>
          <p className="receipt__capture-hint muted">
            Take or choose photos of receipts; they appear on the print-style weekly receipt.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={onPickPhoto}
          />
          <button type="button" className="btn btn--primary receipt__pic-btn" onClick={() => fileRef.current?.click()}>
            Take / add receipt photo
          </button>
          {photoErr ? <p className="receipt__photo-err muted">{photoErr}</p> : null}
          {extras.photos.length > 0 ? (
            <ul className="receipt__thumb-list">
              {extras.photos.map((p) => (
                <li key={p.id} className="receipt__thumb-item">
                  <img src={p.dataUrl} alt="" className="receipt__thumb" />
                  <button type="button" className="btn btn--ghost receipt__thumb-remove" onClick={() => removePhoto(p.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="receipt__manual-block outings__manual">
          <button
            type="button"
            className="btn receipt__manual-toggle"
            onClick={() => setManualOpen((o) => !o)}
            aria-expanded={manualOpen}
          >
            {manualOpen ? 'Hide' : 'Enter manually'} — parking, tolls, Fastrak…
          </button>
          {manualOpen ? (
            <form className="receipt__manual-form" onSubmit={addManualLine}>
              <label className="field-block">
                <span className="field-block__label">Type</span>
                <select className="input input--line" value={manualCat} onChange={(e) => setManualCat(e.target.value)}>
                  {MANUAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-block">
                <span className="field-block__label">Amount ($)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="input input--line"
                  value={manualAmt}
                  onChange={(e) => setManualAmt(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </label>
              <label className="field-block">
                <span className="field-block__label">Note (optional)</span>
                <input
                  type="text"
                  className="input input--line"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="e.g. garage on Oak"
                />
              </label>
              <button type="submit" className="btn btn--primary">
                Add to receipt
              </button>
            </form>
          ) : null}
          {extras.manualLines.length > 0 ? (
            <ul className="receipt__manual-list">
              {extras.manualLines.map((m) => (
                <li key={m.id} className="receipt__manual-row">
                  <span>
                    {categoryLabel(m.category)}
                    {m.note ? ` · ${m.note}` : ''}
                  </span>
                  <span className="receipt__manual-row-amt">${Number(m.amount).toFixed(2)}</span>
                  <button type="button" className="btn btn--ghost receipt__manual-remove" onClick={() => removeManualLine(m.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <p className="muted outings__manual-total">
          Manual reimbursements this week:{' '}
          <strong>${manualTotal.toFixed(2)}</strong>
          {extras.photos.length > 0 ? (
            <>
              {' '}
              · {extras.photos.length} receipt photo(s) on file
            </>
          ) : null}
        </p>

        <Link to={receiptTo} className="btn btn--ghost outings__to-receipt">
          {receiptLinkLabel}
        </Link>
      </section>
    </div>
  )
}
