import { useMemo, useState } from 'react'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import EventsPanelModal from '../components/EventsPanelModal'
import TodaySpaceTile from '../components/TodaySpaceTile'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

function locationPreview(events) {
  if (!events?.length) return ''
  const lead = events[0]?.title ?? ''
  return events.length > 1 ? `${events.length} ideas · ${lead}` : lead
}

export default function EventsPage() {
  const [openPanel, setOpenPanel] = useState(null)
  const byLocation = useMemo(() => groupFamilyEventsByLocation(), [])

  function openEventsPanel(panel) {
    setOpenPanel(panel)
  }

  function closeEventsPanel() {
    setOpenPanel(null)
  }

  const tiles = EVENT_LOCATIONS.map(({ id, label }) => ({
    id,
    label,
    square: true,
    children: (
      <TodaySpaceTile
        count={byLocation[id]?.length ?? 0}
        preview={locationPreview(byLocation[id])}
        hint={`${label} outings — tap to open.`}
        onClick={() => openEventsPanel(id)}
      />
    ),
  }))

  return (
    <div className="page page--events page--workspace page--kid-journal work-ui">
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
