/** Shared gamified UI bits for contract stats teaser + modal. */

export function ContractHudBar({ statusLabel }) {
  return (
    <div className="shift-contract-hud">
      <span className="shift-contract-hud__tag">Loadout</span>
      <span className="shift-contract-hud__status">{statusLabel}</span>
    </div>
  )
}

export function ContractSeasonRing({ percent, sublabel = 'Season' }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div
      className="shift-contract-ring"
      style={{ '--ring-pct': clamped }}
      aria-hidden
    >
      <div className="shift-contract-ring__inner">
        <span className="shift-contract-ring__value">{clamped}%</span>
        <span className="shift-contract-ring__label">{sublabel}</span>
      </div>
    </div>
  )
}

export function ContractResourcePips({ used, total, tone, maxPips = 10 }) {
  const count = Math.min(Math.max(total, 0), maxPips)
  if (count <= 0) return null
  const filled = Math.min(count, Math.max(0, used))
  return (
    <div className={`shift-contract-pips shift-contract-pips--${tone}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`shift-contract-pips__dot${i < filled ? ' shift-contract-pips__dot--spent' : ''}`}
        />
      ))}
    </div>
  )
}

export function ContractResourceTile({ icon, label, left, tag, tone, used, allowance, compact = false }) {
  return (
    <div
      className={`shift-contract-resource${compact ? ' shift-contract-resource--compact' : ''} shift-contract-resource--${tone}`}
    >
      <div className="shift-contract-resource__head">
        <span className="shift-contract-resource__icon" aria-hidden>
          {icon}
        </span>
        <span className={`shift-contract-resource__badge shift-contract-resource__badge--${tone}`}>
          {tag}
        </span>
      </div>
      <div className="shift-contract-resource__score">
        <span className="shift-contract-resource__value">{left}</span>
        <span className="shift-contract-resource__unit">left</span>
      </div>
      <p className="shift-contract-resource__label">{label}</p>
      <ContractResourcePips used={used} total={allowance} tone={tone === 'muted' ? 'contract' : tone} />
    </div>
  )
}

export function ContractStatMeter({ percent, tone, label }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="shift-contract-meter-wrap">
      {label ? (
        <div className="shift-contract-meter-wrap__head">
          <span className="shift-contract-meter-wrap__label">{label}</span>
          <span className="shift-contract-meter-wrap__pct">{clamped}%</span>
        </div>
      ) : null}
      <div
        className={`shift-contract-meter shift-contract-meter--${tone}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div className="shift-contract-meter__fill" style={{ width: `${clamped}%` }} />
        <div className="shift-contract-meter__shine" aria-hidden />
      </div>
    </div>
  )
}

export function ContractSlotBadge({ tag, tone = 'ok' }) {
  return (
    <div className="shift-contract-slot-head">
      <span className={`shift-contract-slot-head__tag shift-contract-slot-head__tag--${tone}`}>
        {tag}
      </span>
    </div>
  )
}
