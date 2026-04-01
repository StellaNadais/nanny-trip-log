import { useCallback, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

/** Main caregiver screens: swipe / horizontal scroll / arrow keys move between them. */
const FLOW_PATHS = ['/', '/schedule', '/hub']

export default function CaregiverFlowLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const shellRef = useRef(null)
  const touchStartX = useRef(null)
  const wheelAccum = useRef(0)
  const wheelDebounce = useRef(null)

  const index = FLOW_PATHS.indexOf(location.pathname)
  const inFlow = index !== -1

  const goNext = useCallback(() => {
    const i = FLOW_PATHS.indexOf(location.pathname)
    if (i >= 0 && i < FLOW_PATHS.length - 1) navigate(FLOW_PATHS[i + 1])
  }, [location.pathname, navigate])

  const goPrev = useCallback(() => {
    const i = FLOW_PATHS.indexOf(location.pathname)
    if (i > 0) navigate(FLOW_PATHS[i - 1])
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!inFlow) return undefined
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inFlow, goNext, goPrev])

  useEffect(() => {
    const el = shellRef.current
    if (!el || !inFlow) return undefined

    const onWheel = (e) => {
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      if (absX < 35 || absX < absY * 1.35) return
      e.preventDefault()
      wheelAccum.current += e.deltaX
      if (wheelDebounce.current) clearTimeout(wheelDebounce.current)
      wheelDebounce.current = setTimeout(() => {
        const acc = wheelAccum.current
        wheelAccum.current = 0
        if (acc > 48) goNext()
        else if (acc < -48) goPrev()
      }, 60)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (wheelDebounce.current) clearTimeout(wheelDebounce.current)
    }
  }, [inFlow, goNext, goPrev])

  function onTouchStart(e) {
    if (!inFlow) return
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e) {
    if (!inFlow || touchStartX.current == null) return
    const endX = e.changedTouches[0].clientX
    const delta = touchStartX.current - endX
    touchStartX.current = null
    if (Math.abs(delta) < 56) return
    if (delta > 0) goNext()
    else goPrev()
  }

  return (
    <div
      ref={shellRef}
      className="caregiver-flow-layout"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <p className="sr-only">
        On home, schedule, and tools you can swipe left or right, or scroll horizontally with a
        trackpad, to change pages. Arrow keys also work.
      </p>
      <Outlet />
    </div>
  )
}
