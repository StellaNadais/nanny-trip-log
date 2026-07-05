import { toISODateLocal } from './dates'

/**
 * California coastal sky — 24h local cycle (Bay Area / NorCal feel).
 * deep / mid / light = gradient stops; glows = ambient orbs behind cards.
 */
const CA_SKY_STOPS = [
  { phase: 0, deep: '#060a14', mid: '#0c1224', light: '#141c34', glowA: [90, 120, 200, 0.12], glowB: [180, 140, 220, 0.08] },
  { phase: 0.12, deep: '#0a0e1c', mid: '#141c36', light: '#222a4a', glowA: [100, 130, 220, 0.14], glowB: [160, 120, 200, 0.1] },
  { phase: 0.18, deep: '#12182e', mid: '#28345a', light: '#4a5888', glowA: [140, 160, 220, 0.16], glowB: [200, 160, 220, 0.12] },
  { phase: 0.22, deep: '#2a2448', mid: '#5a4a78', light: '#9a7aa8', glowA: [200, 160, 220, 0.2], glowB: [255, 180, 200, 0.14] },
  { phase: 0.28, deep: '#4a3048', mid: '#9a6078', light: '#e8a0b0', glowA: [255, 160, 180, 0.22], glowB: [255, 200, 160, 0.18] },
  { phase: 0.34, deep: '#3a4a68', mid: '#6a8ab0', light: '#a8c8e8', glowA: [120, 180, 240, 0.2], glowB: [255, 210, 160, 0.12] },
  { phase: 0.4, deep: '#1a5080', mid: '#3a88b8', light: '#7ec0f0', glowA: [100, 190, 255, 0.22], glowB: [255, 220, 180, 0.1] },
  { phase: 0.48, deep: '#1258a0', mid: '#2a90d0', light: '#68c0f0', glowA: [80, 180, 255, 0.24], glowB: [200, 230, 255, 0.12] },
  { phase: 0.55, deep: '#0e5c9a', mid: '#2890c8', light: '#5ab8e8', glowA: [60, 170, 245, 0.22], glowB: [180, 220, 255, 0.1] },
  { phase: 0.62, deep: '#1a5088', mid: '#4a80b0', light: '#88b8d8', glowA: [90, 160, 230, 0.18], glowB: [200, 210, 240, 0.1] },
  { phase: 0.68, deep: '#4a4858', mid: '#8a7868', light: '#d8b888', glowA: [255, 190, 120, 0.22], glowB: [255, 160, 100, 0.16] },
  { phase: 0.74, deep: '#5a2838', mid: '#c06068', light: '#f0a0a8', glowA: [255, 120, 140, 0.26], glowB: [255, 180, 120, 0.2] },
  { phase: 0.8, deep: '#4a2048', mid: '#a84878', light: '#f07898', glowA: [255, 100, 150, 0.28], glowB: [255, 140, 180, 0.22] },
  { phase: 0.86, deep: '#2a1a40', mid: '#6a4878', light: '#a878a8', glowA: [200, 120, 200, 0.2], glowB: [180, 140, 220, 0.18] },
  { phase: 0.92, deep: '#121428', mid: '#2a3050', light: '#4a5078', glowA: [120, 140, 220, 0.16], glowB: [160, 120, 200, 0.12] },
  { phase: 0.97, deep: '#080c18', mid: '#101828', light: '#1a2240', glowA: [80, 100, 180, 0.12], glowB: [140, 100, 180, 0.08] },
  { phase: 1, deep: '#060a14', mid: '#0c1224', light: '#141c34', glowA: [90, 120, 200, 0.12], glowB: [180, 140, 220, 0.08] },
]

function parseHex(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function mixHex(a, b, t) {
  const A = parseHex(a)
  const B = parseHex(b)
  const r = Math.round(A.r + (B.r - A.r) * t)
  const g = Math.round(A.g + (B.g - A.g) * t)
  const bl = Math.round(A.b + (B.b - A.b) * t)
  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

function mixGlow(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    a[3] + (b[3] - a[3]) * t,
  ]
}

function sampleSky(phase) {
  const p = Math.max(0, Math.min(1, phase))
  let i = 0
  while (i < CA_SKY_STOPS.length - 1 && CA_SKY_STOPS[i + 1].phase < p) i += 1
  const a = CA_SKY_STOPS[i]
  const b = CA_SKY_STOPS[Math.min(i + 1, CA_SKY_STOPS.length - 1)]
  if (a.phase === b.phase) return { ...a, phase: p }
  const t = (p - a.phase) / (b.phase - a.phase)
  return {
    phase: p,
    deep: mixHex(a.deep, b.deep, t),
    mid: mixHex(a.mid, b.mid, t),
    light: mixHex(a.light, b.light, t),
    glowA: mixGlow(a.glowA, b.glowA, t),
    glowB: mixGlow(a.glowB, b.glowB, t),
  }
}

function hexLuminance(hex) {
  const { r, g, b } = parseHex(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** Fraction through the 24h day (0 = midnight) for the viewed journal date. */
export function getJournalDaySkyPhase(dateISO, now = new Date()) {
  if (!dateISO) return 0.48

  const todayIso = toISODateLocal(now)
  if (dateISO < todayIso) return 0.8 // past days: sunset memory
  if (dateISO > todayIso) return 0.24 // future: soft dawn

  const h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
  return h / 24
}

const PHASE_LABELS = [
  [0.14, 'Night'],
  [0.2, 'Pre-dawn'],
  [0.26, 'Sunrise'],
  [0.36, 'Morning'],
  [0.52, 'Midday'],
  [0.66, 'Afternoon'],
  [0.72, 'Golden hour'],
  [0.8, 'Sunset'],
  [0.9, 'Twilight'],
  [1.01, 'Night'],
]

export function journalDaySkyLabel(phase) {
  for (const [max, label] of PHASE_LABELS) {
    if (phase < max) return label
  }
  return 'Night'
}

/** CSS custom properties + gradient for the journal page canvas. */
export function getJournalDaySkyStyle(dateISO, now = new Date()) {
  const phase = getJournalDaySkyPhase(dateISO, now)
  const sky = sampleSky(phase)
  const background = `linear-gradient(168deg, ${sky.deep} 0%, ${sky.mid} 38%, ${sky.light} 68%, ${sky.deep} 100%)`
  const lum = hexLuminance(sky.mid)
  const lightSky = lum > 0.48

  const inkOnPage = lightSky ? '#1a2438' : '#f2f6ff'
  const inkMutedOnPage = lightSky ? '#3d4a62' : '#c8d4e8'
  const [ga0, ga1, ga2, gaA] = sky.glowA
  const [gb0, gb1, gb2, gbA] = sky.glowB

  return {
    phase,
    label: journalDaySkyLabel(phase),
    background,
    style: {
      '--journal-bg-deep': sky.deep,
      '--journal-bg-mid': sky.mid,
      '--journal-bg-light': sky.light,
      '--journal-glow-mint': `rgba(${ga0}, ${ga1}, ${ga2}, ${gaA})`,
      '--journal-glow-gold': `rgba(${gb0}, ${gb1}, ${gb2}, ${gbA})`,
      '--journal-ink-on-page': inkOnPage,
      '--journal-ink-muted-on-page': inkMutedOnPage,
      background,
    },
  }
}
