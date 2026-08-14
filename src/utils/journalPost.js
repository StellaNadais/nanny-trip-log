import { scanTripLogChunks } from './tripTextScan'

/**
 * The caretaker's first sentence is the journal lead; everything after it is
 * the body. Keep the original punctuation and line breaks.
 */
export function splitJournalPost(dayNotes) {
  const text = String(dayNotes || '').trim()
  if (!text) return { lead: '', body: '' }

  const match = text.match(/^(.+?[.!?])(?:\s+|$)/)
  const lead = match ? match[1] : text

  return {
    lead,
    body: text.slice(lead.length).trim(),
  }
}

/**
 * Read the structured journal fields when present. Older entries retain their
 * first-sentence lead/body behavior and place detection from `dayNotes`.
 */
export function journalPostFromEntry(entry = {}) {
  const routeText = String(entry.routeText ?? entry.route ?? '').trim()
  const title = String(entry.title ?? '').trim()
  const paragraph = String(entry.paragraph ?? entry.body ?? '').trim()

  if (routeText || title || paragraph) {
    return { routeText, title, paragraph, isLegacy: false }
  }

  const legacy = splitJournalPost(entry.dayNotes)
  return {
    routeText: '',
    title: legacy.lead,
    paragraph: legacy.body,
    isLegacy: true,
  }
}

/** Keep a legacy combined note available for reports that still consume it. */
export function combineJournalPost({ routeText, title, paragraph }) {
  return [routeText, title, paragraph]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join('\n')
}

/**
 * Removes a route-list prefix from preview text without changing saved notes.
 * A single place remains intact unless it is followed by an explicit separator,
 * so narrative such as "School was a lot of fun." is not mistaken for a route.
 */
export function stripLeadingRoutePlaces(text, routePlaceIds = []) {
  const summary = String(text || '').trim()
  const visiblePlaceIds = new Set(routePlaceIds.filter(Boolean))
  if (!summary || !visiblePlaceIds.size) return summary

  const chunks = scanTripLogChunks(summary)
  let index = 0
  let lastPlaceEnd = 0
  let placeCount = 0

  while (chunks[index]?.type === 'place' || chunks[index]?.type === 'token') {
    const placeChunk = chunks[index]
    if (!placeChunk.place || !visiblePlaceIds.has(placeChunk.place.id)) break

    placeCount += 1
    lastPlaceEnd = placeChunk.end
    index += 1

    const gap = chunks[index]
    if (!gap || gap.type !== 'text' || !/^[\s,]+$/.test(gap.value)) break

    index += 1
  }

  const nextText = chunks[index]?.type === 'text' ? chunks[index].value : ''
  const hasExplicitSeparator = /^[\s]*[,;:—–\-|]/.test(nextText)
  if (placeCount < 2 && !hasExplicitSeparator) return summary

  return summary.slice(lastPlaceEnd).replace(/^[\s,;:—–\-|]+/, '').trimStart()
}
