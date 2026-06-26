import { useCallback, useMemo, useState } from 'react'
import { loadTileOrder, saveTileOrder } from '../utils/workspaceLayoutStorage'

/**
 * Movable tile grid (xtiles-style reorder). Drag the grip to rearrange.
 * @param {{ workspaceId: string, tiles: { id: string, label: string, span?: number, children: import('react').ReactNode }[] }} props
 */
export default function WorkspaceTileBoard({ workspaceId, tiles }) {
  const defaultOrder = useMemo(() => tiles.map((t) => t.id), [tiles])
  const tileMap = useMemo(() => Object.fromEntries(tiles.map((t) => [t.id, t])), [tiles])

  const [order, setOrder] = useState(() => loadTileOrder(workspaceId, defaultOrder))
  const [dragId, setDragId] = useState(null)

  const orderedTiles = useMemo(
    () => order.map((id) => tileMap[id]).filter(Boolean),
    [order, tileMap]
  )

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
          className={`workspace-tile${dragId === tile.id ? ' workspace-tile--dragging' : ''}${tile.span === 2 ? ' workspace-tile--wide' : ''}${tile.square ? ' workspace-tile--square' : ''}${tile.hideHead ? ' workspace-tile--headless' : ''}`}
          onDragOver={(e) => onDragOver(e, tile.id)}
        >
          {tile.hideHead ? null : (
            <header className="workspace-tile__head">
              <span className="workspace-tile__label">{tile.label}</span>
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
            </header>
          )}
          <div className="workspace-tile__body">{tile.children}</div>
        </article>
      ))}
    </div>
  )
}
