import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadTileOrder, saveTileOrder } from '../utils/workspaceLayoutStorage'

/**
 * Movable tile grid (xtiles-style reorder). Drag the grip to rearrange.
 * Tiles with `pinned: true` stay at the end and are excluded from saved order.
 * @param {{ workspaceId: string, tiles: { id: string, label: string, span?: number, square?: boolean, hideHead?: boolean, pinned?: boolean, noDrag?: boolean, children: import('react').ReactNode }[] }} props
 */
export default function WorkspaceTileBoard({ workspaceId, tiles }) {
  const pinnedTiles = useMemo(() => tiles.filter((t) => t.pinned), [tiles])
  const movableTiles = useMemo(() => tiles.filter((t) => !t.pinned), [tiles])
  const defaultOrder = useMemo(() => movableTiles.map((t) => t.id), [movableTiles])
  const defaultOrderKey = defaultOrder.join('|')
  const tileMap = useMemo(() => Object.fromEntries(tiles.map((t) => [t.id, t])), [tiles])

  const [order, setOrder] = useState(() => loadTileOrder(workspaceId, defaultOrder))
  const [dragId, setDragId] = useState(null)

  useEffect(() => {
    setOrder((prev) => {
      const next = prev.filter((id) => defaultOrder.includes(id))
      for (const id of defaultOrder) {
        if (!next.includes(id)) next.push(id)
      }
      if (next.join('|') !== prev.join('|')) {
        saveTileOrder(workspaceId, next)
      }
      return next
    })
  }, [workspaceId, defaultOrderKey, defaultOrder])

  const orderedTiles = useMemo(() => {
    const movable = order.map((id) => tileMap[id]).filter(Boolean)
    return [...movable, ...pinnedTiles]
  }, [order, tileMap, pinnedTiles])

  const persistOrder = useCallback(
    (next) => {
      setOrder(next)
      saveTileOrder(workspaceId, next)
    },
    [workspaceId]
  )

  function onDragStart(id) {
    setDragId(id)
  }

  function onDragEnd() {
    setDragId(null)
  }

  function onDragOver(e, overId) {
    e.preventDefault()
    if (!dragId || dragId === overId) return
    if (tileMap[overId]?.pinned || tileMap[dragId]?.pinned) return
    const from = order.indexOf(dragId)
    const to = order.indexOf(overId)
    if (from < 0 || to < 0 || from === to) return
    const next = [...order]
    next.splice(from, 1)
    next.splice(to, 0, dragId)
    persistOrder(next)
  }

  return (
    <div className="workspace-tile-board" aria-label="Workspace tiles">
      {orderedTiles.map((tile) => (
        <article
          key={tile.id}
          className={`workspace-tile${dragId === tile.id ? ' workspace-tile--dragging' : ''}${tile.span === 2 ? ' workspace-tile--wide' : ''}${tile.square ? ' workspace-tile--square' : ''}${tile.hideHead ? ' workspace-tile--headless' : ''}${tile.pinned ? ' workspace-tile--pinned' : ''}`}
          onDragOver={(e) => onDragOver(e, tile.id)}
        >
          {tile.hideHead ? null : (
            <header className="workspace-tile__head">
              <span className="workspace-tile__label">{tile.label}</span>
              {tile.pinned || tile.noDrag ? null : (
                <button
                  type="button"
                  className="workspace-tile__grip"
                  draggable
                  aria-label={`Move ${tile.label} tile`}
                  onDragStart={() => onDragStart(tile.id)}
                  onDragEnd={onDragEnd}
                >
                  ⠿
                </button>
              )}
            </header>
          )}
          <div className="workspace-tile__body">{tile.children}</div>
        </article>
      ))}
    </div>
  )
}
