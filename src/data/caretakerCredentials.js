/**
 * Caretaker access credentials.
 * Passwords use the same last-name-plus-year convention as the family portal.
 */
export const CARETAKER_CREDENTIALS = [
  {
    nickname: 'stelli',
    password: 'nadais2026',
  },
  {
    nickname: 'merick',
    password: 'nadais2026',
  },
]

export function normalizeCaretakerCredential(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

export function checkCaretakerCredentials(nickname, password) {
  const normalizedNickname = normalizeCaretakerCredential(nickname)
  const normalizedPassword = normalizeCaretakerCredential(password)

  return CARETAKER_CREDENTIALS.some(
    (credential) =>
      normalizedNickname === credential.nickname &&
      normalizedPassword === credential.password,
  )
}
