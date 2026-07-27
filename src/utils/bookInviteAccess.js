const STORAGE_KEY = 'nanny-book-invite-unlock-v1'

function readAcceptedInvites() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((token) => typeof token === 'string') : []
  } catch {
    return []
  }
}

export function acceptBookInvite(inviteToken) {
  const token = String(inviteToken || '').trim().toLowerCase()
  if (!token) return

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...new Set([...readAcceptedInvites(), token])])
    )
  } catch {
    /* Ignore quota and private browsing failures. The active invite URL still works. */
  }
}
