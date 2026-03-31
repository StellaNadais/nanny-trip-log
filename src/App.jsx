import { Route, Routes } from 'react-router-dom'
import { ShiftPunctualityProvider } from './context/ShiftPunctualityProvider'
import { KidJournalProvider } from './context/KidJournalProvider'
import { BookingsProvider } from './context/BookingsProvider'
import WelcomePage from './pages/WelcomePage'
import BookPage from './pages/BookPage'
import SchedulePage from './pages/SchedulePage'
import HubPage from './pages/HubPage'
import TripLogPage from './pages/TripLogPage'
import ShiftPage from './pages/ShiftPage'
import KidJournalPage from './pages/KidJournalPage'
import InternalNotesPage from './pages/InternalNotesPage'
import PlaceholderPage from './pages/PlaceholderPage'
import './App.css'
import './pages/pages.css'

export default function App() {
  return (
    <ShiftPunctualityProvider>
      <KidJournalProvider>
        <BookingsProvider>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/trip-log" element={<TripLogPage />} />
            <Route path="/shift" element={<ShiftPage />} />
            <Route path="/journal" element={<KidJournalPage />} />
            <Route path="/notes" element={<InternalNotesPage />} />
            <Route path="/deck" element={<PlaceholderPage slug="deck" />} />
          </Routes>
        </BookingsProvider>
      </KidJournalProvider>
    </ShiftPunctualityProvider>
  )
}
