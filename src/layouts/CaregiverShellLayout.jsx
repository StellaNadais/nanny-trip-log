import { Outlet, useLocation } from 'react-router-dom'
import JournalDayProgress from '../components/JournalDayProgress'
import { toISODateLocal } from '../utils/dates'

/** Caregiver routes that show the shared day-in-progress bar (welcome excluded). */
const DAY_PROGRESS_PATHS = new Set([
  '/schedule',
  '/hub',
  '/shift',
  '/journal',
  '/outings',
  '/events',
  '/notes',
])

export default function CaregiverShellLayout() {
  const { pathname } = useLocation()
  const showDayProgress = pathname !== '/' && DAY_PROGRESS_PATHS.has(pathname)

  const todayIso = toISODateLocal(new Date())
  const todayLabel = new Date(`${todayIso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={`caregiver-shell${showDayProgress ? '' : ' caregiver-shell--plain'}`}>
      {showDayProgress ? (
        <div className="caregiver-page-chrome" aria-label="Day in progress">
          <JournalDayProgress dateISO={todayIso} dateLabel={todayLabel} variant="thin" />
        </div>
      ) : null}
      <div className="caregiver-shell__body">
        <Outlet />
      </div>
    </div>
  )
}
