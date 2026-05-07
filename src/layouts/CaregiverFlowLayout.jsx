import { useCallback, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

/** Main caregiver screens: home → schedule is tap-only; vertical edge scroll advances only Schedule → Tools. */
const FLOW_PATHS = ['/', '/schedule', '/hub']

const SCROLL_EDGE_PX = 36

/** Flow screens often scroll inside `.caregiver-flow-layout .page` (e.g. schedule), not the document. */
function getFlowScrollEl() {
  const page = document.querySelector('.caregiver-flow-layout .page')
  if (!page) return document.scrollingElement || document.documentElement
  const cs = window.getComputedStyle(page)
  const yScrollable = cs.overflowY === 'auto' || cs.overflowY === 'scroll'
  if (yScrollable && page.scrollHeight > page.clientHeight + 2) return page
  return document.scrollingElement || document.documentElement
}

function atScrollBottom() {
  const el = getFlowScrollEl()
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_EDGE_PX
}

function atScrollTop() {
  const el = getFlowScrollEl()
  if (!el) return true
  return el.scrollTop < SCROLL_EDGE_PX
}

export default function CaregiverFlowLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const shellRef = useRef(null)
  const touchStart = useRef(null)
  const wheelAccum = useRef(0)
  const wheelDebounce = useRef(null)
  const scrollFlowCooldown = useRef(false)

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

  const bumpScrollFlowCooldown = useCallback(() => {
    scrollFlowCooldown.current = true
    window.setTimeout(() => {
      scrollFlowCooldown.current = false
    }, 480)
  }, [])

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

  /** Vertical wheel at scroll edge: only Schedule → Tools (forward); Tools → Schedule at top (backward). */
  useEffect(() => {
    if (!inFlow) return undefined
    const onWindowWheel = (e) => {
      if (scrollFlowCooldown.current) return
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      if (absY < absX * 1.15 || absY < 18) return
      if (e.deltaY > 0 && location.pathname === '/schedule' && atScrollBottom()) {
        e.preventDefault()
        bumpScrollFlowCooldown()
        goNext()
        return
      }
      if (e.deltaY < 0 && location.pathname === '/hub' && atScrollTop()) {
        e.preventDefault()
        bumpScrollFlowCooldown()
        goPrev()
      }
    }
    window.addEventListener('wheel', onWindowWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWindowWheel)
  }, [inFlow, location.pathname, goNext, goPrev, bumpScrollFlowCooldown])

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
        if (acc > 48) {
          if (location.pathname !== '/') goNext()
        } else if (acc < -48) goPrev()
      }, 60)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (wheelDebounce.current) clearTimeout(wheelDebounce.current)
    }
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
    if (scrollFlowCooldown.current) return

    if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) >= 56) {
      if (dx > 0) {
        if (location.pathname !== '/') goNext()
      } else goPrev()
      return
    }

    if (Math.abs(dy) >= 52) {
      if (dy > 0 && location.pathname === '/schedule' && atScrollBottom()) {
        bumpScrollFlowCooldown()
        goNext()
      } else if (dy < 0 && location.pathname === '/hub' && atScrollTop()) {
        bumpScrollFlowCooldown()
        goPrev()
      }
    }
  }

  return (
    <div
      ref={shellRef}
      className="caregiver-flow-layout"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <p className="sr-only">
        Home opens your schedule when you tap the screen. From the schedule, swipe left or scroll horizontally on a
        trackpad for Tools; at the bottom of the schedule, one more scroll down also opens Tools. From Tools, swipe
        right or scroll up at the top to return to the schedule. Arrow keys move between schedule and tools; the right
        arrow does not advance from home. Tap the footer link on the schedule for Tools.
      </p>
      <Outlet />
    </div>
  )
}
