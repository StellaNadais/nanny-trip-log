import EventsLocationList from './EventsLocationList'
import TodayPanelModal from './TodayPanelModal'

const PANEL_META = {
  moraga: { eyebrow: 'Demo area', title: 'Cedar Grove', dateLabel: 'Local family ideas' },
  lafayette: { eyebrow: 'Demo area', title: 'Riverview', dateLabel: 'Local family ideas' },
  oakland: { eyebrow: 'Demo area', title: 'Bayfront', dateLabel: 'Local family ideas' },
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
      <EventsLocationList events={byLocation[panel]} />
    </TodayPanelModal>
  )
}
