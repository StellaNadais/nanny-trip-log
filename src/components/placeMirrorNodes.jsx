import { splitTripLogForMirror } from '../utils/parseTripPlaces'

function placeClass(region) {
  if (region === 'moraga') return 'trip-place--moraga'
  if (region === 'lafayette') return 'trip-place--lafayette'
  if (region === 'client') return 'trip-place--client'
  if (region === 'park') return 'trip-place--park'
  if (region === 'museum') return 'trip-place--museum'
  if (region === 'downtown') return 'trip-place--downtown'
  if (region === 'outing') return 'trip-place--outing'
  if (region === 'custom') return 'trip-place--custom'
  return 'trip-place--unknown'
}

/** Mirror rendering: delimiters + counted place pills (same as TripPlacesField). */
export function mirrorNodesFromChunks(chunks) {
  const nodes = []
  let k = 0
  for (const c of chunks) {
    if (c.type === 'text') {
      const parts = c.value.split(/([,;.\n]+)/)
      for (const part of parts) {
        if (!part) continue
        if (/^[,;.\n]+$/.test(part)) {
          nodes.push(
            <span key={k++} className="meals-inline-delim">
              {part}
            </span>
          )
        } else {
          nodes.push(<span key={k++}>{part}</span>)
        }
      }
      continue
    }
    const cls = [
      'trip-place',
      c.place ? 'trip-place--counted' : '',
      c.place ? placeClass(c.place.region) : 'trip-place--unknown',
    ]
      .filter(Boolean)
      .join(' ')
    nodes.push(
      <span key={k++} className={cls}>
        {c.value}
      </span>
    )
  }
  return nodes
}

export function placeMirrorChildrenFromText(text) {
  return mirrorNodesFromChunks(splitTripLogForMirror(text))
}
