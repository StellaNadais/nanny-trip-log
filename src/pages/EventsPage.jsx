import { useMemo, useState } from 'react'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { formatWorldCupMatch, upcomingWorldCupGames } from '../data/worldCup2026'
import { toISODateLocal } from '../utils/dates'
import EventsPanelModal from '../components/EventsPanelModal'
import TodaySpaceTile from '../components/TodaySpaceTile'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

const LOCATION_ICONS = {
  moraga: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  lafayette: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  oakland: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
    </svg>
  ),
  'world-cup': (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
}

function locationPreview(events) {
  if (!events?.length) return ''
  const lead = events[0]?.title ?? ''
  return events.length > 1 ? `${events.length} ideas · ${lead}` : lead
}

export default function EventsPage() {
  const [openPanel, setOpenPanel] = useState(null)
  const byLocation = useMemo(() => groupFamilyEventsByLocation(), [])
  const worldCupGames = useMemo(() => upcomingWorldCupGames(toISODateLocal(new Date())), [])

  const worldCupPreview = worldCupGames.length
    ? formatWorldCupMatch(worldCupGames[0])
    : 'No upcoming games'

  function openEventsPanel(panel) {
    setOpenPanel(panel)
  }

  function closeEventsPanel() {
    setOpenPanel(null)
  }

  const tiles = [
    ...EVENT_LOCATIONS.map(({ id, label }) => ({
      id,
      label,
      square: true,
      children: (
        <TodaySpaceTile
          icon={LOCATION_ICONS[id]}
          count={byLocation[id]?.length ?? 0}
          preview={locationPreview(byLocation[id])}
          hint={`${label} outings — tap to open.`}
          onClick={() => openEventsPanel(id)}
        />
      ),
    })),
    {
      id: 'world-cup',
      label: 'World Cup',
      square: true,
      children: (
        <TodaySpaceTile
          icon={LOCATION_ICONS['world-cup']}
          count={worldCupGames.length}
          preview={worldCupPreview}
          hint="Tournament dates — tap to open."
          onClick={() => openEventsPanel('world-cup')}
        />
      ),
    },
  ]

  return (
    <div className="page page--events page--workspace work-ui">
      <div className="journal__layout events__layout">
        <WorkspaceTileBoard workspaceId="events" tiles={tiles} />
      </div>

      <EventsPanelModal
        open={openPanel != null}
        onClose={closeEventsPanel}
        panel={openPanel}
        byLocation={byLocation}
      />
    </div>
  )
}
