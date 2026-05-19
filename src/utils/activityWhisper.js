/** Quick activity sparks — cycled subliminally in the UI when the app is open. */
export const ACTIVITY_WHISPER_SUGGESTIONS = Object.freeze([
  'Giant bubbles',
  'Chalk',
  'Run on the grass with arms open',
  'Paint',
  'Arts and crafts',
  'Freeze dance',
  'Water play outside',
  'Picnic blanket stories',
  'Nature scavenger hunt',
  'Obstacle course indoors',
])

/**
 * @param {string} [previous]
 */
export function pickActivityWhisper(previous) {
  if (ACTIVITY_WHISPER_SUGGESTIONS.length === 0) return ''
  let next = ACTIVITY_WHISPER_SUGGESTIONS[Math.floor(Math.random() * ACTIVITY_WHISPER_SUGGESTIONS.length)]
  let guard = 0
  while (next === previous && guard < 8) {
    next = ACTIVITY_WHISPER_SUGGESTIONS[Math.floor(Math.random() * ACTIVITY_WHISPER_SUGGESTIONS.length)]
    guard++
  }
  return next
}

/** Preset positions (% of app column) — inset from edges so labels stay inside the shell. */
export const ACTIVITY_WHISPER_SPOTS = Object.freeze([
  { top: 38, left: 50 },
  { top: 52, left: 32 },
  { top: 56, left: 68 },
  { top: 44, left: 64 },
  { top: 48, left: 36 },
  { top: 62, left: 50 },
])

export function pickWhisperSpot(previousIndex) {
  if (ACTIVITY_WHISPER_SPOTS.length === 0) return { top: 45, left: 50, i: 0 }
  let i = Math.floor(Math.random() * ACTIVITY_WHISPER_SPOTS.length)
  let guard = 0
  while (i === previousIndex && guard < 8) {
    i = Math.floor(Math.random() * ACTIVITY_WHISPER_SPOTS.length)
    guard++
  }
  const s = ACTIVITY_WHISPER_SPOTS[i]
  return { top: s.top, left: s.left, i }
}
