const STORAGE_KEY = 'nanny-caretaker-unlock-v1'

export function isCaretakerUnlocked() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function unlockCaretaker() {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    /* ignore private mode / storage errors */
  }
}

export function lockCaretaker() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore private mode / storage errors */
  }
}
