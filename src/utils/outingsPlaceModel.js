/**
 * Maps a saved outing row into a trip-place shape for mileage + highlighting.
 * Miles come from the segment graph (legFromId + legMiles, or legacy milesRoundTrip from home).
 * @param {{ id: string, label: string, nickname: string, milesRoundTrip?: number, legFromId?: string, legMiles?: number }} r
 */
export function outingRecordToPlace(r) {
  if (!r || typeof r.id !== 'string' || typeof r.label !== 'string') return null
  const label = r.label.trim()
  if (!label) return null
  const hasLeg = typeof r.legFromId === 'string' && Number.isFinite(r.legMiles) && r.legMiles >= 0
  const hasRound =
    typeof r.milesRoundTrip === 'number' && Number.isFinite(r.milesRoundTrip) && r.milesRoundTrip >= 0
  if (!hasLeg && !hasRound) return null
  const nick = typeof r.nickname === 'string' ? r.nickname.trim() : ''
  const aliases = nick && nick.toLowerCase() !== label.toLowerCase() ? [nick] : []
  return {
    id: r.id,
    label,
    aliases,
    region: 'custom',
  }
}
