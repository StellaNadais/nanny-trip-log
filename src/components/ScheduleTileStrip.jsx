import { useEffect, useRef, useState } from 'react'

const DRAG_THRESHOLD_PX = 8

/**
 * Horizontal Schedule tile row with touch swipe, mouse drag, and prev/next arrows.
 */
export default function ScheduleTileStrip({ tiles, label = 'Schedule boxes' }) {
  const scrollerRef = useRef(null)
  const dragRef = useRef(null)
  const skipClickRef = useRef(false)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  function itemStride() {
    const el = scrollerRef.current
    const item = el?.querySelector('.schedule-tile-strip__item')
    if (!el || !item) return el?.clientWidth ?? 0
    const styles = window.getComputedStyle(el)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    return item.getBoundingClientRect().width + gap
  }

  function scrollByDir(dir) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * itemStride(), behavior: 'smooth' })
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return undefined

    function syncArrows() {
      const max = Math.max(0, el.scrollWidth - el.clientWidth)
      setCanPrev(el.scrollLeft > 4)
      setCanNext(el.scrollLeft < max - 4)
    }

    syncArrows()
    el.addEventListener('scroll', syncArrows, { passive: true })
    const observer = new ResizeObserver(syncArrows)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', syncArrows)
      observer.disconnect()
    }
  }, [])

  function onPointerDown(e) {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    if (e.button !== 0) return
    const el = scrollerRef.current
    if (!el) return
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    }
  }

  function onPointerMove(e) {
    const drag = dragRef.current
    const el = scrollerRef.current
    if (!drag || !el || e.pointerId !== drag.pointerId) return
    const dx = e.clientX - drag.startX
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return
    if (!drag.moved) {
      drag.moved = true
      el.setPointerCapture(e.pointerId)
    }
    el.scrollLeft = drag.startScroll - dx
  }

  function endDrag(e) {
    const drag = dragRef.current
    const el = scrollerRef.current
    if (!drag || e.pointerId !== drag.pointerId) return
    if (drag.moved && el) {
      skipClickRef.current = true
      const stride = itemStride()
      if (stride > 0) {
        const index = Math.round(el.scrollLeft / stride)
        el.scrollTo({ left: index * stride, behavior: 'smooth' })
      }
      window.setTimeout(() => {
        skipClickRef.current = false
      }, 0)
    }
    dragRef.current = null
  }

  function onClickCapture(e) {
    if (!skipClickRef.current) return
    e.preventDefault()
    e.stopPropagation()
    skipClickRef.current = false
  }

  return (
    <div className="schedule-tile-strip">
      <div
        ref={scrollerRef}
        className="schedule-tile-strip__scroller"
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            scrollByDir(-1)
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            scrollByDir(1)
          }
        }}
      >
        {tiles.map((tile) => (
          <article key={tile.id} className="schedule-tile-strip__item">
            {tile.children}
          </article>
        ))}
      </div>

      <button
        type="button"
        className="schedule-tile-strip__arrow schedule-tile-strip__arrow--prev"
        aria-label="Previous boxes"
        disabled={!canPrev}
        onClick={() => scrollByDir(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="schedule-tile-strip__arrow schedule-tile-strip__arrow--next"
        aria-label="Next boxes"
        disabled={!canNext}
        onClick={() => scrollByDir(1)}
      >
        ›
      </button>
    </div>
  )
}
