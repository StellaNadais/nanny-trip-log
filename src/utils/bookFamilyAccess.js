const STORAGE_KEY = 'nanny-book-family-unlock-v1'

function readUnlocked() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

function writeUnlocked(slugs) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(slugs)]))
  } catch {
    /* ignore quota / private mode */
  }
}

export function isBookFamilyUnlocked(slug) {
  const key = String(slug || '')
    .trim()
    .toLowerCase()
  if (!key) return false
  return readUnlocked().includes(key)
}

export function unlockBookFamily(slug) {
  const key = String(slug || '')
    .trim()
    .toLowerCase()
  if (!key) return
  writeUnlocked([...readUnlocked(), key])
}

export function lockBookFamily(slug) {
  const key = String(slug || '')
    .trim()
    .toLowerCase()
  writeUnlocked(readUnlocked().filter((s) => s !== key))
}
