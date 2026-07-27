import { useRef, useState } from 'react'
import { BRING_ALONG_TOYS } from '../data/bringAlongToys'

function BringAlongArt({ toy }) {
  const [hasImageError, setHasImageError] = useState(false)

  return (
    <span className={`bring-along__art bring-along__art--${toy.color}`}>
      <img
        className="bring-along__image"
        src={toy.image}
        alt={`Animated ${toy.name}`}
        hidden={hasImageError}
        onError={() => setHasImageError(true)}
      />
      <span className="bring-along__emoji-fallback" hidden={!hasImageError} aria-hidden="true">
        {toy.icon}
      </span>
    </span>
  )
}

export default function BringAlongCarousel({ selectedIds = [], onToggle }) {
  const trackRef = useRef(null)
  const selected = new Set(selectedIds)

  function browse(direction) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.bring-along-carousel__card')
    const distance = card ? card.getBoundingClientRect().width : 220
    track.scrollBy({ left: direction * distance, behavior: 'smooth' })
  }

  return (
    <section className="bring-along-carousel" aria-labelledby="bring-along-carousel-title">
      <div className="bring-along-carousel__head">
        <div>
          <p className="bring-along-carousel__eyebrow">Play kit</p>
          <h2 id="bring-along-carousel-title">Bring with me</h2>
        </div>
        {selected.size ? (
          <span className="bring-along-carousel__count" aria-live="polite">
            {selected.size} picked
          </span>
        ) : null}
      </div>

      <div className="bring-along-carousel__browse">
        <button
          type="button"
          className="bring-along-carousel__arrow"
          onClick={() => browse(-1)}
          aria-label="Previous toys"
        >
          ‹
        </button>
        <div className="bring-along-carousel__track" ref={trackRef}>
          {BRING_ALONG_TOYS.map((toy) => {
            const isSelected = selected.has(toy.id)
            return (
              <button
                type="button"
                key={toy.id}
                className={`bring-along-carousel__card${isSelected ? ' bring-along-carousel__card--selected' : ''}`}
                onClick={() => onToggle(toy.id)}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? 'Remove' : 'Add'} ${toy.name} ${isSelected ? 'from' : 'to'} your bring-along list`}
              >
                <BringAlongArt toy={toy} />
                <span className="bring-along-carousel__card-name">{toy.name}</span>
                <span className="bring-along-carousel__price">${toy.price}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="bring-along-carousel__arrow"
          onClick={() => browse(1)}
          aria-label="Next toys"
        >
          ›
        </button>
      </div>
    </section>
  )
}
