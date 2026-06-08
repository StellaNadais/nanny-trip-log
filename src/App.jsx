import { Navigate, Route, Routes } from 'react-router-dom'
import { ShiftPunctualityProvider } from './context/ShiftPunctualityProvider'
import { KidJournalProvider } from './context/KidJournalProvider'
import { BookingsProvider } from './context/BookingsProvider'
import WelcomePage from './pages/WelcomePage'
import BookPage from './pages/BookPage'
import SchedulePage from './pages/SchedulePage'
import HubPage from './pages/HubPage'
import WeeklyReceiptPage from './pages/WeeklyReceiptPage'
import ShiftPage from './pages/ShiftPage'
import KidJournalPage from './pages/KidJournalPage'
import InternalNotesPage from './pages/InternalNotesPage'
import OutingsPage from './pages/OutingsPage'
import EventsPage from './pages/EventsPage'
import CaregiverFlowLayout from './layouts/CaregiverFlowLayout'
import CaregiverShellLayout from './layouts/CaregiverShellLayout'
import './App.css'
import './pages/pages.css'
import './pages/work-ui.css'

export default function App() {
  return (
    <ShiftPunctualityProvider>
      <KidJournalProvider>
        <BookingsProvider>
          <Routes>
            <Route path="/book" element={<BookPage />} />
            <Route element={<CaregiverShellLayout />}>
              <Route element={<CaregiverFlowLayout />}>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/hub" element={<HubPage />} />
              </Route>
              <Route path="/trip-log" element={<Navigate to="/journal" replace />} />
              <Route path="/receipt" element={<WeeklyReceiptPage />} />
              <Route path="/shift" element={<ShiftPage />} />
              <Route path="/journal" element={<KidJournalPage />} />
              <Route path="/outings" element={<OutingsPage />} />
              <Route path="/notes" element={<InternalNotesPage />} />
              <Route path="/events" element={<EventsPage />} />
            </Route>
          </Routes>
        </BookingsProvider>
      </KidJournalProvider>
    </ShiftPunctualityProvider>
  )
}
