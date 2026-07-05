/** Custom Today board box types — labels, hints, and form copy. */
export const TODAY_TILE_TYPES = [
  {
    id: 'note',
    label: 'Notes',
    icon: '📝',
    hint: 'Quick thoughts, lists, or anything on your mind.',
    previewPlaceholder: 'Tap to write…',
    eyebrow: 'Your note',
  },
  {
    id: 'link',
    label: 'Link',
    icon: '🔗',
    hint: 'Save a URL — article, recipe, or reference.',
    previewPlaceholder: 'Tap to open…',
    eyebrow: 'Saved link',
  },
  {
    id: 'gif',
    label: 'GIF',
    icon: '✨',
    hint: 'Paste a GIF image URL for a little joy.',
    previewPlaceholder: 'Add a GIF URL…',
    eyebrow: 'GIF box',
  },
  {
    id: 'ideas',
    label: 'Ideas board',
    icon: '📌',
    hint: 'Pinterest-style pins — crafts, outings, inspo.',
    previewPlaceholder: 'Collect ideas…',
    eyebrow: 'Ideas board',
  },
]

export const TODAY_TILE_TYPE_MAP = Object.fromEntries(TODAY_TILE_TYPES.map((t) => [t.id, t]))

export const TODAY_TILE_ACCENTS = ['peach', 'mint', 'lavender', 'sky']

export function todayTileAccent(index) {
  return TODAY_TILE_ACCENTS[index % TODAY_TILE_ACCENTS.length]
}
