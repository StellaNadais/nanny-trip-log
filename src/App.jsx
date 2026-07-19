import { Navigate, Route, Routes } from 'react-router-dom'
import { ShiftPunctualityProvider } from './context/ShiftPunctualityProvider'
import { KidJournalProvider } from './context/KidJournalProvider'
import { BookingsProvider } from './context/BookingsProvider'
import { ParentRemindersProvider } from './context/ParentRemindersProvider'
import WelcomePage from './pages/WelcomePage'
import CaretakerAccessPage from './pages/CaretakerAccessPage'
import BookAccessPage from './pages/BookAccessPage'
import BookPage from './pages/BookPage'
import SchedulePage from './pages/SchedulePage'
import WeeklyReceiptPage from './pages/WeeklyReceiptPage'
import KidJournalPage from './pages/KidJournalPage'
import EventsPage from './pages/EventsPage'
import CaregiverFlowLayout from './layouts/CaregiverFlowLayout'
import CaregiverShellLayout from './layouts/CaregiverShellLayout'
import WorkbookLayout from './layouts/WorkbookLayout'
import CaretakerGate from './components/CaretakerGate'
import './App.css'
import './pages/pages.css'
import './pages/work-ui.css'
import './pages/schedule-dashboard.css'
import './pages/schedule-journal.css'
import './pages/schedule-handcrafted.css'
import './pages/book-journal.css'
import './pages/book-portal.css'
import './pages/bring-along.css'
import './pages/shift-setup.css'
import './pages/shift-journal.css'
import './pages/events-journal.css'
import './pages/outings-journal.css'
import './pages/workspace-shell.css'
import './tech-type.css'

export default function App() {
  return (
    <ShiftPunctualityProvider>
      <KidJournalProvider>
        <BookingsProvider>
          <ParentRemindersProvider>
          <Routes>
            <Route path="/book" element={<BookAccessPage />} />
            <Route path="/book/:family" element={<BookPage />} />
            <Route element={<CaregiverShellLayout />}>
              <Route element={<CaregiverFlowLayout />}>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/caretaker" element={<CaretakerAccessPage />} />
              </Route>
              <Route element={<WorkbookLayout />}>
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/hub" element={<Navigate to="/schedule" replace />} />
              </Route>
              <Route element={<CaretakerGate />}>
                <Route path="/trip-log" element={<Navigate to="/journal" replace />} />
                <Route path="/receipt" element={<WeeklyReceiptPage />} />
                <Route element={<WorkbookLayout />}>
                  <Route path="/today" element={<Navigate to="/journal" replace />} />
                  <Route path="/shift" element={<Navigate to="/journal" replace />} />
                  <Route path="/journal" element={<KidJournalPage />} />
                  <Route path="/outings" element={<Navigate to="/journal" replace />} />
                  <Route path="/events" element={<EventsPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
          </ParentRemindersProvider>
        </BookingsProvider>
      </KidJournalProvider>
    </ShiftPunctualityProvider>
  )
}
