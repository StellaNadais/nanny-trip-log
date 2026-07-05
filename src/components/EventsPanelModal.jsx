import EventsLocationList from './EventsLocationList'
import TodayPanelModal from './TodayPanelModal'
import WorldCupGamesPanel from './WorldCupGamesPanel'

const PANEL_META = {
  moraga: {
    eyebrow: 'East Bay',
    title: 'Moraga',
    subtitle: 'Local family ideas',
    lede: 'Family-friendly ideas around Moraga — confirm dates and hours with each place.',
    footer: 'Venue details can change; double-check before you go.',
  },
  lafayette: {
    eyebrow: 'East Bay',
    title: 'Lafayette',
    subtitle: 'Local family ideas',
    lede: 'Outings near Lafayette — check each venue for current hours and fees.',
    footer: 'Venue details can change; double-check before you go.',
  },
  oakland: {
    eyebrow: 'East Bay',
    title: 'Oakland',
    subtitle: 'Local family ideas',
    lede: 'Museums, parks, and city outings — confirm times before you head out.',
    footer: 'Venue details can change; double-check before you go.',
  },
  'world-cup': {
    eyebrow: 'FIFA 2026',
    title: 'World Cup',
    subtitle: 'USMNT & tournament dates',
    lede: 'USMNT, Levi\u2019s Stadium, and tournament dates. Brazil and Argentina games are outlined. Times Pacific.',
    footer: 'Match times and broadcasts can shift — verify before kickoff.',
  },
}

export default function EventsPanelModal({ open, onClose, panel, byLocation }) {
  if (!panel) return null

  const meta = PANEL_META[panel]
  if (!meta) return null

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title={meta.title}
      hideHead
      hideFoot
      modalClassName="about-today-modal--events-popup"
    >
      <section className="soft-panel soft-panel--events-list soft-panel--events-popup" aria-labelledby="events-popup-title">
        <div className="soft-panel__hero">
          <p className="soft-panel__eyebrow">{meta.eyebrow}</p>
          <h2 id="events-popup-title" className="soft-panel__title">
            {meta.title}
          </h2>
          <p className="soft-panel__meta muted">{meta.subtitle}</p>
          <p className="soft-panel__lede">{meta.lede}</p>
        </div>

        {panel === 'world-cup' ? (
          <WorldCupGamesPanel variant="modal" />
        ) : (
          <EventsLocationList events={byLocation[panel]} variant="modal" />
        )}

        <p className="soft-panel__footer">{meta.footer}</p>
      </section>
    </TodayPanelModal>
  )
}
