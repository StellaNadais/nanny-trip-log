import { useMemo } from 'react'
import { splitTripLogForMirror } from '../utils/parseTripPlaces'
import { mirrorNodesFromChunks } from './placeMirrorNodes'

/**
 * Trip / outing notes with place nicknames highlighted.
 */
export default function TripPlacesField({
  id,
  value,
  onChange,
  placeholder = '',
  'aria-labelledby': ariaLabelledby,
  nestedInAbout = false,
}) {
  const chunks = useMemo(() => splitTripLogForMirror(value), [value])
  const mirrorChildren = useMemo(() => mirrorNodesFromChunks(chunks), [chunks])

  return (
    <div
      className={`meals-today-field trip-places-as-meals${nestedInAbout ? ' trip-places-as-meals--about-nested' : ''}`}
    >
      <div className="meals-inline-host">
        <div className="meals-inline-inner">
          <div className="meals-inline-mirror" aria-hidden>
            {chunks.length === 0 && value === '' ? (
              '\u00a0'
            ) : mirrorChildren.length === 0 ? (
              '\u00a0'
            ) : (
              mirrorChildren
            )}
          </div>
          <textarea
            id={id}
            className="meals-inline-ta"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-labelledby={ariaLabelledby}
            spellCheck="true"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
