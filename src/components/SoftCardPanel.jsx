export const SOFT_CARD_TONES = ['peach', 'mint', 'lavender', 'sky']

export const SOFT_CARD_ICONS = ['◎', '◆', '✦', '★']

export function softCardTone(index) {
  return SOFT_CARD_TONES[index % SOFT_CARD_TONES.length]
}

export function softCardIcon(index) {
  return SOFT_CARD_ICONS[index % SOFT_CARD_ICONS.length]
}

/** Gradient card shell — shared by Thank you + Events popups. */
export default function SoftCardPanel({ lede, footer, children, className = '' }) {
  return (
    <div className={`soft-panel${className ? ` ${className}` : ''}`}>
      {lede ? <p className="soft-panel__lede muted">{lede}</p> : null}
      {children}
      {footer ? <p className="soft-panel__footer">{footer}</p> : null}
    </div>
  )
}

export function SoftCard({ index, icon, tone, title, children, className = '' }) {
  return (
    <li
      className={`soft-panel__card soft-panel__card--${tone}${className ? ` ${className}` : ''}`}
    >
      <div className="soft-panel__card-head">
        <span className="soft-panel__card-num" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>
        {icon ? (
          <span className="soft-panel__card-icon" aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <strong className="soft-panel__card-title">{title}</strong>
      {children}
    </li>
  )
}
