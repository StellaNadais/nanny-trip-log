/**
 * Caretaker access credentials.
 * Passwords use the same last-name-plus-year convention as the family portal.
 */
export const CARETAKER_CREDENTIALS = {
  nickname: 'stelli',
  password: 'nadais2026',
}

export function normalizeCaretakerCredential(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

export function checkCaretakerCredentials(nickname, password) {
  return (
    normalizeCaretakerCredential(nickname) === CARETAKER_CREDENTIALS.nickname &&
    normalizeCaretakerCredential(password) === CARETAKER_CREDENTIALS.password
  )
}
