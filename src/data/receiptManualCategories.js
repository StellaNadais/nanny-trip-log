export const MANUAL_CATEGORIES = [
  { id: 'parking_ticket', label: 'Parking ticket', tone: 'peach' },
  { id: 'parking_spot', label: 'Parking spot', tone: 'mint' },
  { id: 'ticket_entry', label: 'Ticket / entry', tone: 'lavender' },
  { id: 'tolls', label: 'Tolls', tone: 'sky' },
  { id: 'fastrak', label: 'Fastrak', tone: 'sun' },
  { id: 'other', label: 'Other', tone: 'rose' },
]

export function categoryLabel(id) {
  return MANUAL_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export function categoryMeta(id) {
  return MANUAL_CATEGORIES.find((c) => c.id === id) ?? MANUAL_CATEGORIES[MANUAL_CATEGORIES.length - 1]
}
