import { Navigate, Route, Routes } from 'react-router-dom'
import { ShiftPunctualityProvider } from './context/ShiftPunctualityProvider'
import { KidJournalProvider } from './context/KidJournalProvider'
import { BookingsProvider } from './context/BookingsProvider'
import ToolStartGate from './components/ToolStartGate'
import WelcomePage from './pages/WelcomePage'
import BookPage from './pages/BookPage'
import SchedulePage from './pages/SchedulePage'
import WeeklyReceiptPage from './pages/WeeklyReceiptPage'
import ShiftPage from './pages/ShiftPage'
import KidJournalPage from './pages/KidJournalPage'
import InternalNotesPage from './pages/InternalNotesPage'
import EventsPage from './pages/EventsPage'
import CaregiverFlowLayout from './layouts/CaregiverFlowLayout'
import { CAREGIVER_TOOLS } from './data/caregiverTools'
import './App.css'
import './pages/pages.css'
import './pages/work-ui.css'

const TOOL_BY_PATH = Object.fromEntries(CAREGIVER_TOOLS.map((t) => [t.to, t]))

function ToolRoute({ path, element }) {
  const meta = TOOL_BY_PATH[path]
  if (!meta) return element
  return (
    <ToolStartGate title={meta.label} code={meta.code} hint={meta.hint}>
      {element}
    </ToolStartGate>
  )
}

export default function App() {
  return (
    <ShiftPunctualityProvider>
      <KidJournalProvider>
        <BookingsProvider>
          <Routes>
            <Route element={<CaregiverFlowLayout />}>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
            </Route>
            <Route path="/book" element={<BookPage />} />
            <Route path="/hub" element={<Navigate to="/schedule" replace />} />
            <Route path="/trip-log" element={<Navigate to="/journal" replace />} />
            <Route path="/outings" element={<Navigate to="/journal" replace />} />
            <Route path="/receipt" element={<WeeklyReceiptPage />} />
            <Route path="/shift" element={<ToolRoute path="/shift" element={<ShiftPage />} />} />
            <Route path="/journal" element={<ToolRoute path="/journal" element={<KidJournalPage />} />} />
            <Route path="/notes" element={<ToolRoute path="/notes" element={<InternalNotesPage />} />} />
            <Route path="/events" element={<ToolRoute path="/events" element={<EventsPage />} />} />
          </Routes>
        </BookingsProvider>
      </KidJournalProvider>
    </ShiftPunctualityProvider>
  )
}
