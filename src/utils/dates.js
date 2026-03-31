/** Monday of the week containing `d` (local calendar). */
export function startOfWeekMonday(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

export function toISODateLocal(d) {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function weekDaysFromMonday(monday) {
  return DAY_LABELS.map((label, i) => {
    const date = addDays(monday, i)
    return {
      label,
      iso: toISODateLocal(date),
      date,
    }
  })
}

export function formatWeekRange(monday) {
  const sun = addDays(monday, 6)
  const opts = { month: 'short', day: 'numeric' }
  const a = monday.toLocaleDateString(undefined, opts)
  const b = sun.toLocaleDateString(undefined, {
    ...opts,
    year: monday.getFullYear() !== sun.getFullYear() ? 'numeric' : undefined,
  })
  return `${a} – ${b}`
}
