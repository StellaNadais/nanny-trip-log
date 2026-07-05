import { TODAY_TILE_TYPE_MAP } from '../data/todayTileTypes'
import { isLikelyImageUrl, todayTileCount, todayTilePreviewText } from '../utils/todayCustomTilesStorage'

/** Square tile preview for a user-created Today board box. */
export default function TodayCustomTilePreview({ tile, onClick }) {
  const typeMeta = TODAY_TILE_TYPE_MAP[tile.type]
  const preview = todayTilePreviewText(tile)
  const count = todayTileCount(tile)
  const showGif = tile.type === 'gif' && tile.url && isLikelyImageUrl(tile.url)

  return (
    <button
      type="button"
      className={`today-custom-tile today-custom-tile--${tile.type} today-custom-tile--${tile.accent || 'lavender'}`}
      onClick={onClick}
    >
      {showGif ? (
        <span className="today-custom-tile__media" aria-hidden>
          <img src={tile.url} alt="" loading="lazy" />
        </span>
      ) : (
        <span className="today-custom-tile__icon" aria-hidden>
          {typeMeta?.icon ?? '✦'}
        </span>
      )}
      {count > 0 ? (
        <span className="today-custom-tile__count" aria-hidden>
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
      <p className="today-custom-tile__preview">
        {preview || (
          <span className="today-custom-tile__hint muted">
            {typeMeta?.previewPlaceholder ?? 'Tap to open…'}
          </span>
        )}
      </p>
      <span className="today-custom-tile__cta">Open →</span>
    </button>
  )
}
