/** Split pasted or typed grocery text into separate line items. */
export function parseGroceryDraft(raw) {
  return String(raw || '')
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
