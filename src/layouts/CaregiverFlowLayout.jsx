import { useCallback, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

/** Home → schedule → hub (swipe on touch; arrow keys). */
const FLOW_PATHS = ['/', '/schedule', '/hub']

const SWIPE_MIN_PX = 56

export default function CaregiverFlowLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const touchStart = useRef(null)

  const inFlow = FLOW_PATHS.includes(location.pathname)

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
        if (location.pathname !== '/') goNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inFlow, location.pathname, goNext, goPrev])

  function onTouchStart(e) {
    if (!inFlow) return
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchEnd(e) {
    if (!inFlow || touchStart.current == null) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const dx = touchStart.current.x - endX
    const dy = touchStart.current.y - endY
    touchStart.current = null

    if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) >= SWIPE_MIN_PX) {
      if (dx > 0) {
        if (location.pathname !== '/') goNext()
      } else goPrev()
    }
  }

  return (
    <div
      className="caregiver-flow-layout"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <p className="sr-only">
        Home opens your schedule when you tap the screen. Swipe left from schedule to open Tools flash
        cards, or use the link at the bottom. Swipe right from Tools to return to schedule. Arrow keys
        move between home, schedule, and tools; the right arrow does not advance from home.
      </p>
      <Outlet />
    </div>
  )
}
