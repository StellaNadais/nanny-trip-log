import { toISODateLocal } from './dates'

/** Bumped when default season / leave balances change. */
const KEY = 'nanny-shift-contract-v2'

function seedUsedDays(kind, count, year, month) {
  const out = []
  for (let i = 0; i < count; i++) {
    const day = String(i + 1).padStart(2, '0')
    const dateISO = `${year}-${String(month).padStart(2, '0')}-${day}`
    out.push({ id: `${kind}-seed-${dateISO}`, dateISO, kind })
  }
  return out
}

function defaultContractYear() {
  const y = new Date().getFullYear()
  const vacationAllowance = 10
  const sickAllowance = 5
  return {
    contractStartISO: `${y}-06-01`,
    contractEndISO: `${y}-08-21`,
    vacationAllowance,
    sickAllowance,
    // Demo default: all leave already used
    timeOff: [
      ...seedUsedDays('vacation', vacationAllowance, y, 6),
      ...seedUsedDays('sick', sickAllowance, y, 7),
    ],
  }
}

function normalize(raw) {
  const base = defaultContractYear()
  if (!raw || typeof raw !== 'object') return base
  return {
    contractStartISO: String(raw.contractStartISO ?? base.contractStartISO).slice(0, 10),
    contractEndISO: String(raw.contractEndISO ?? base.contractEndISO).slice(0, 10),
    vacationAllowance: Math.max(0, Number(raw.vacationAllowance) || base.vacationAllowance),
    sickAllowance: Math.max(0, Number(raw.sickAllowance) || base.sickAllowance),
    timeOff: Array.isArray(raw.timeOff)
      ? raw.timeOff
          .filter((e) => e && (e.kind === 'vacation' || e.kind === 'sick') && e.dateISO)
          .map((e) => ({
            id: String(e.id || `${e.dateISO}-${e.kind}`),
            dateISO: String(e.dateISO).slice(0, 10),
            kind: e.kind,
          }))
      : [],
  }
}

export function loadShiftContract() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultContractYear()
    return normalize(JSON.parse(raw))
  } catch {
    return defaultContractYear()
  }
}

export function saveShiftContract(data) {
  localStorage.setItem(KEY, JSON.stringify(normalize(data)))
}

export function countTimeOff(timeOff, kind) {
  return (timeOff || []).filter((e) => e.kind === kind).length
}

export function timeOffForDate(timeOff, dateISO) {
  return (timeOff || []).find((e) => e.dateISO === dateISO) ?? null
}

/** @returns {{ percent: number, daysLeft: number, daysTotal: number, daysElapsed: number, label: string }} */
export function contractProgress(startISO, endISO, today = new Date()) {
  if (!startISO || !endISO) {
    return { percent: 0, daysLeft: 0, daysTotal: 0, daysElapsed: 0, label: 'Set season dates' }
  }
  const start = new Date(`${startISO}T12:00:00`)
  const end = new Date(`${endISO}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return { percent: 0, daysLeft: 0, daysTotal: 0, daysElapsed: 0, label: 'Check dates' }
  }
  const now = new Date(`${toISODateLocal(today)}T12:00:00`)
  const daysTotal = Math.max(1, Math.round((end - start) / 86400000))
  const daysElapsed = Math.min(daysTotal, Math.max(0, Math.round((now - start) / 86400000)))
  const daysLeft = Math.max(0, daysTotal - daysElapsed)
  const percent = Math.min(100, Math.round((daysElapsed / daysTotal) * 100))
  return {
    percent,
    daysLeft,
    daysTotal,
    daysElapsed,
    label: `${percent}% through season · ${daysLeft}d left`,
  }
}

export function resourceStatus(used, allowance) {
  const left = Math.max(0, allowance - used)
  if (allowance <= 0) return { left: 0, tag: 'N/A', tone: 'muted' }
  if (left <= 0) return { left: 0, tag: 'Empty', tone: 'danger' }
  if (left <= 2) return { left, tag: 'Low', tone: 'warn' }
  return { left, tag: 'Stocked', tone: 'ok' }
}
