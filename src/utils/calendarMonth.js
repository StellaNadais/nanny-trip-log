/** Sunday-first week: column order Sun … Sat */

export function monthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const last = new Date(year, monthIndex + 1, 0)
  const pad = first.getDay() // 0 = Sunday → empty cells before the 1st
  const daysInMonth = last.getDate()
  const cells = []
  for (let i = 0; i < pad; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
