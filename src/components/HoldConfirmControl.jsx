import { usePressAndHold } from '../hooks/usePressAndHold'

const RING_R = 46
const RING_C = 2 * Math.PI * RING_R

/**
 * Press and hold ~3.8s — a line traces the circle, then onConfirm fires.
 */
export default function HoldConfirmControl({
  enabled = false,
  onConfirm,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const { progress, holding, pointerProps, justCompleted } = usePressAndHold({
    enabled,
    onComplete: onConfirm,
  })

  function handleClick(e) {
    if (justCompleted()) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  const strokeOffset = RING_C * (1 - progress)

  return (
    <button
      type="button"
      className={`hold-confirm${holding ? ' hold-confirm--holding' : ''}${enabled ? ' hold-confirm--armed' : ''} ${className}`.trim()}
      onClick={handleClick}
      {...(enabled ? pointerProps : {})}
      {...rest}
    >
      {enabled ? (
        <svg className="hold-confirm__ring" viewBox="0 0 100 100" aria-hidden>
          <circle className="hold-confirm__ring-track" cx="50" cy="50" r={RING_R} />
          <circle
            className="hold-confirm__ring-progress"
            cx="50"
            cy="50"
            r={RING_R}
            strokeDasharray={RING_C}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
      ) : null}
      <span className="hold-confirm__content">{children}</span>
    </button>
  )
}
