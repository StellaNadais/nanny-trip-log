import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { addDays, formatWeekRange, toISODateLocal } from '../utils/dates'
import { useTripLog } from '../hooks/useTripLog'
import { DayStrip } from '../components/DayStrip'
import { DayLogPanel } from '../components/DayLogPanel'
import { TodoPanel } from '../components/TodoPanel'
import { ExpensePanel } from '../components/ExpensePanel'
import '../App.css'

const TABS = [
  { id: 'log', label: 'Daily log' },
  { id: 'todos', label: "To-do's" },
  { id: 'expenses', label: 'Expenses' },
]

export default function TripLogPage() {
  const log = useTripLog()
  const [tab, setTab] = useState('log')
  const [dayOffset, setDayOffset] = useState(0)

  const selectedIso = useMemo(
    () => toISODateLocal(addDays(log.weekStart, dayOffset)),
    [log.weekStart, dayOffset]
  )

  const day = log.daysByIso[selectedIso]

  return (
    <div className="app">
      <header className="app__header">
        <div className="page-toolbar">
          <Link to="/hub" className="page-back">
            ← Hub
          </Link>
        </div>
        <div className="app__title-row">
          <h1 className="app__title">Trip log</h1>
          <span className="app__subtitle">Weekly care notes</span>
        </div>
        <div className="week-nav">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => log.shiftWeek(-1)}
            aria-label="Previous week"
          >
            ‹
          </button>
          <span className="week-nav__range">{formatWeekRange(log.weekStart)}</span>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => log.shiftWeek(1)}
            aria-label="Next week"
          >
            ›
          </button>
          <label className="week-nav__picker">
            <span className="sr-only">Jump to week</span>
            <input
              type="date"
              value={log.weekKey}
              onChange={(e) => log.setWeekFromPicker(e.target.value)}
            />
          </label>
        </div>
        <div className="meta-row">
          <label className="meta-field">
            <span className="meta-field__l">Schedule</span>
            <input
              type="text"
              className="input input--line input--compact"
              value={log.weekMeta.scheduleLine}
              onChange={(e) =>
                log.setWeekMeta((m) => ({ ...m, scheduleLine: e.target.value }))
              }
              placeholder="e.g. Stella 7:30 × 2 kids"
            />
          </label>
          <label className="meta-field">
            <span className="meta-field__l">Children</span>
            <input
              type="text"
              className="input input--line input--compact"
              value={log.weekMeta.childrenNames}
              onChange={(e) =>
                log.setWeekMeta((m) => ({ ...m, childrenNames: e.target.value }))
              }
              placeholder="Names"
            />
          </label>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tabs__btn ${tab === t.id ? 'tabs__btn--on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app__main">
        {tab === 'log' && (
          <>
            <DayStrip
              weekStart={log.weekStart}
              selectedIso={selectedIso}
              onSelect={(iso) => {
                const a = new Date(log.weekKey + 'T12:00:00')
                const b = new Date(iso + 'T12:00:00')
                const diff = Math.round((b - a) / 86400000)
                setDayOffset(Math.max(0, Math.min(6, diff)))
              }}
            />
            <div className="app__scroll">
              <DayLogPanel
                iso={selectedIso}
                day={day}
                ensureDay={log.ensureDay}
                onChange={log.updateDay}
              />
            </div>
          </>
        )}
        {tab === 'todos' && (
          <div className="app__scroll">
            <TodoPanel
              todos={log.todos}
              onAdd={log.addTodo}
              onToggle={log.toggleTodo}
              onRemove={log.removeTodo}
            />
          </div>
        )}
        {tab === 'expenses' && (
          <div className="app__scroll">
            <ExpensePanel
              expenses={log.expenses}
              onAdd={log.addExpense}
              onRemove={log.removeExpense}
            />
          </div>
        )}
      </main>
    </div>
  )
}
