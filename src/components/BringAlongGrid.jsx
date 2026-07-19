import { BRING_ALONG_TOYS } from '../data/bringAlongToys'

export default function BringAlongGrid({
  heading,
  description,
  selectedIds = [],
  onToggle,
  className = '',
}) {
  const selected = new Set(selectedIds)
  const selectable = typeof onToggle === 'function'

  return (
    <section className={`bring-along ${className}`.trim()} aria-labelledby={`${heading}-title`}>
      <div className="bring-along__head">
        <div>
          <p className="bring-along__eyebrow">Play kit</p>
          <h2 id={`${heading}-title`} className="bring-along__title">
            {heading}
          </h2>
        </div>
        {selectable ? (
          <span className="bring-along__count" aria-live="polite">
            {selected.size ? `${selected.size} picked` : 'Pick favorites'}
          </span>
        ) : null}
      </div>
      <p className="bring-along__lede">{description}</p>
      <div className="bring-along__grid">
        {BRING_ALONG_TOYS.map((toy) => {
          const isSelected = selected.has(toy.id)
          const label = selectable
            ? `${isSelected ? 'Remove' : 'Add'} ${toy.name} ${isSelected ? 'from' : 'to'} your bring-along list`
            : toy.name
          const content = (
            <>
              <span className={`bring-along__art bring-along__art--${toy.color}`} aria-hidden="true">
                {toy.icon}
              </span>
              <span className="bring-along__card-name">{toy.name}</span>
              {selectable ? (
                <span className="bring-along__card-action">{isSelected ? 'Packed' : 'Add to pack'}</span>
              ) : null}
            </>
          )

          return selectable ? (
            <button
              type="button"
              key={toy.id}
              className={`bring-along__card${isSelected ? ' bring-along__card--selected' : ''}`}
              onClick={() => onToggle(toy.id)}
              aria-pressed={isSelected}
              aria-label={label}
            >
              {content}
            </button>
          ) : (
            <article className="bring-along__card" key={toy.id}>
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}
