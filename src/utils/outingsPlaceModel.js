/**
 * Maps a saved outing row into a trip-place shape for mileage + highlighting.
 * @param {{ id: string, label: string, nickname: string, milesOneWay: number }} r
 */
export function outingRecordToPlace(r) {
  if (!r || typeof r.label !== 'string') return null
  const label = r.label.trim()
  if (!label) return null
  const miles = Number(r.milesOneWay)
  if (!Number.isFinite(miles) || miles < 0) return null
  const nick = typeof r.nickname === 'string' ? r.nickname.trim() : ''
  const aliases = nick ? [nick] : []
  return {
    id: r.id,
    label,
    aliases,
    region: 'custom',
    milesOneWay: miles,
  }
}
