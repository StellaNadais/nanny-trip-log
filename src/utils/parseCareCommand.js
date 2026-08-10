const COMMANDS = {
  grocery: 'grocery',
  groceries: 'grocery',
  shopping: 'grocery',
  reminder: 'reminder',
  reminders: 'reminder',
  note: 'reminder',
  notes: 'reminder',
  errand: 'errand',
  errands: 'errand',
}

/**
 * Turns a lightweight Slack-style prefix into a care-task destination.
 * Plain language is intentionally treated as a parent note.
 */
export function parseCareCommand(value) {
  const draft = String(value || '').trim()
  if (!draft) return { kind: null, text: '', error: 'Write a note before sending it.' }

  const match = draft.match(/^\/([a-z]+)(?:\s+([\s\S]*))?$/i)
  if (!match) return { kind: 'reminder', text: draft, usedCommand: false }

  const kind = COMMANDS[match[1].toLowerCase()]
  if (!kind) {
    return {
      kind: null,
      text: '',
      error: `Try /grocery, /reminder, or /errand.`,
    }
  }

  const text = String(match[2] || '').trim()
  if (!text) {
    return {
      kind: null,
      text: '',
      error: `Add details after /${match[1].toLowerCase()}.`,
    }
  }

  return { kind, text, usedCommand: true }
}
