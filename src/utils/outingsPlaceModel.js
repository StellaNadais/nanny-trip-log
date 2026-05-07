/**
 * Maps a saved outing row into a trip-place shape for mileage + highlighting.
 * Stored `milesRoundTrip` is split to one-way for the shared place model (`computeTripMileageForText` still uses one-way internally).
 * @param {{ id: string, label: string, nickname: string, milesRoundTrip?: number, milesOneWay?: number }} r
 */
export function outingRecordToPlace(r) {
  if (!r || typeof r.label !== 'string') return null
  const label = r.label.trim()
  if (!label) return null
  let milesRoundTrip
  if (typeof r.milesRoundTrip === 'number' && Number.isFinite(r.milesRoundTrip)) {
    milesRoundTrip = r.milesRoundTrip
  } else if (typeof r.milesOneWay === 'number' && Number.isFinite(r.milesOneWay)) {
    milesRoundTrip = r.milesOneWay * 2
  } else {
    return null
  }
  if (milesRoundTrip < 0) return null
  const nick = typeof r.nickname === 'string' ? r.nickname.trim() : ''
  const aliases = nick ? [nick] : []
  return {
    id: r.id,
    label,
    aliases,
    region: 'custom',
    milesOneWay: Math.round((milesRoundTrip / 2) * 100) / 100,
  }
}
