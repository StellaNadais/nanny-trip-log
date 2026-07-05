import { useCallback, useEffect, useRef, useState } from 'react'

export const HOLD_CONFIRM_MS = 3800

/**
 * Press-and-hold progress (0–1). Calls onComplete after HOLD_CONFIRM_MS.
 */
export function usePressAndHold({ enabled, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const rafRef = useRef(null)
  const startRef = useRef(0)
  const completedRef = useRef(false)
  const holdStartedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const cancel = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    startRef.current = 0
    setHolding(false)
    setProgress(0)
  }, [])

  useEffect(() => cancel, [cancel])

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current
    const p = Math.min(1, elapsed / HOLD_CONFIRM_MS)
    setProgress(p)
    if (p >= 1) {
      rafRef.current = null
      completedRef.current = true
      holdStartedRef.current = false
      setHolding(false)
      setProgress(0)
      onCompleteRef.current?.()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(
    (e) => {
      if (!enabled) return
      e.preventDefault()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      holdStartedRef.current = true
      startRef.current = Date.now()
      completedRef.current = false
      setHolding(true)
      setProgress(0)
      rafRef.current = requestAnimationFrame(tick)
    },
    [enabled, tick]
  )

  const end = useCallback(() => {
    if (completedRef.current) return
    cancel()
  }, [cancel])

  const pointerProps = enabled
    ? {
        onPointerDown: start,
        onPointerUp: end,
        onPointerCancel: end,
        onLostPointerCapture: end,
        onContextMenu: (e) => e.preventDefault(),
      }
    : {}

  return {
    progress,
    holding,
    pointerProps,
    justCompleted: () => {
      if (!completedRef.current) return false
      completedRef.current = false
      return true
    },
    holdStartedWithoutComplete: () => {
      if (!holdStartedRef.current) return false
      holdStartedRef.current = false
      return true
    },
  }
}
