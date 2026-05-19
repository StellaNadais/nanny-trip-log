import { useCallback, useEffect, useRef, useState } from 'react'
import { pickActivityWhisper, pickWhisperSpot } from '../utils/activityWhisper'

/** Keep in sync with `activity-whisper-raw` duration in App.css */
export const ACTIVITY_WHISPER_DISPLAY_MS = 12_000

const TWO_HOURS_MS = 2 * 60 * 60 * 1000
const HIDDEN_RETRY_MS = 30_000

/**
 * Activity hints: 2h idle gap after each flash (and before the first), only while the tab is visible.
 * Renders inside the centered app column (matches #root), not the rainbow edge strips.
 */
export default function ActivityWhisperOverlay() {
  const [session, setSession] = useState(null)
  const prevLabelRef = useRef(null)
  const prevSpotRef = useRef(-1)
  const scheduleAfterDisplayRef = useRef(() => {})

  useEffect(() => {
    let gapTimer

    const clearGap = () => {
      if (gapTimer != null) {
        window.clearTimeout(gapTimer)
        gapTimer = null
      }
    }

    const tryShow = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        gapTimer = window.setTimeout(tryShow, HIDDEN_RETRY_MS)
        return
      }
      const next = pickActivityWhisper(prevLabelRef.current)
      const spot = pickWhisperSpot(prevSpotRef.current)
      prevLabelRef.current = next
      prevSpotRef.current = spot.i
      setSession({
        key: `${Date.now()}-${spot.i}`,
        label: next,
        top: spot.top,
        left: spot.left,
      })
    }

    const queueGap = () => {
      clearGap()
      gapTimer = window.setTimeout(() => {
        gapTimer = null
        tryShow()
      }, TWO_HOURS_MS)
    }

    scheduleAfterDisplayRef.current = queueGap
    queueGap()

    return clearGap
  }, [])

  const onAnimEnd = useCallback(() => {
    setSession(null)
    scheduleAfterDisplayRef.current()
  }, [])

  useEffect(() => {
    if (!session) return
    const mq =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq?.matches) return
    const t = window.setTimeout(() => {
      setSession(null)
      scheduleAfterDisplayRef.current()
    }, ACTIVITY_WHISPER_DISPLAY_MS)
    return () => window.clearTimeout(t)
  }, [session])

  if (!session) return null

  return (
    <div className="activity-whisper-anchor" aria-hidden="true">
      <div
        key={session.key}
        className="activity-whisper"
        style={{ top: `${session.top}%`, left: `${session.left}%` }}
        onAnimationEnd={onAnimEnd}
      >
        {session.label}
      </div>
    </div>
  )
}
