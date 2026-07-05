import { TODAY_TILE_TYPE_MAP } from '../data/todayTileTypes'
import TodayCustomTilePanel from './TodayCustomTilePanel'
import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel } from './TodaySoftPanel'

export default function TodayCustomTileModal({ open, tile, onClose, onChange, onDelete }) {
  if (!tile) return null

  const typeMeta = TODAY_TILE_TYPE_MAP[tile.type]

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title={tile.title}
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="today-custom-tile-title"
        eyebrow={typeMeta?.eyebrow ?? 'Your box'}
        title={tile.title}
        lede={typeMeta?.hint ?? 'Edit your box — changes save as you go.'}
      >
        <TodayCustomTilePanel
          tile={tile}
          onChange={onChange}
          embedded
          onDelete={() => {
            onDelete?.()
            onClose()
          }}
        />
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
