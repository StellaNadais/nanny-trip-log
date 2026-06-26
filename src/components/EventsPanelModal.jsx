import EventsLocationList from './EventsLocationList'
import TodayPanelModal from './TodayPanelModal'
import WorldCupGamesPanel from './WorldCupGamesPanel'

const PANEL_META = {
  moraga: { eyebrow: 'East Bay', title: 'Moraga', dateLabel: 'Local family ideas' },
  lafayette: { eyebrow: 'East Bay', title: 'Lafayette', dateLabel: 'Local family ideas' },
  oakland: { eyebrow: 'East Bay', title: 'Oakland', dateLabel: 'Local family ideas' },
  'world-cup': { eyebrow: 'FIFA 2026', title: 'World Cup', dateLabel: 'USMNT & tournament dates' },
}

export default function EventsPanelModal({ open, onClose, panel, byLocation }) {
  if (!panel) return null

  const meta = PANEL_META[panel]
  if (!meta) return null

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow={meta.eyebrow}
      title={meta.title}
      dateLabel={meta.dateLabel}
    >
      {panel === 'world-cup' ? <WorldCupGamesPanel /> : <EventsLocationList events={byLocation[panel]} />}
    </TodayPanelModal>
  )
}
