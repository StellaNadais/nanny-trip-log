export const MANUAL_CATEGORIES = [
  { id: 'parking_ticket', label: 'Parking ticket' },
  { id: 'parking_spot', label: 'Parking spot' },
  { id: 'ticket_entry', label: 'Ticket / entry' },
  { id: 'tolls', label: 'Tolls' },
  { id: 'fastrak', label: 'Fastrak' },
  { id: 'other', label: 'Other' },
]

export function categoryLabel(id) {
  return MANUAL_CATEGORIES.find((c) => c.id === id)?.label ?? id
}
