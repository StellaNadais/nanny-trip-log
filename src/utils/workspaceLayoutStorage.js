const KEY = 'nanny-workspace-layout-v1'

function loadAll() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  } catch {
    return {}
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/** @returns {string[]} */
export function loadTileOrder(workspaceId, defaultOrder) {
  const all = loadAll()
  const row = all[workspaceId]
  if (!Array.isArray(row) || !row.length) return [...defaultOrder]
  const known = new Set(defaultOrder)
  const filtered = row.filter((id) => known.has(id))
  for (const id of defaultOrder) {
    if (!filtered.includes(id)) filtered.push(id)
  }
  return filtered
}

export function saveTileOrder(workspaceId, order) {
  const all = loadAll()
  all[workspaceId] = order
  saveAll(all)
}
