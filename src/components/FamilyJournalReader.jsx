import { useMemo, useState } from 'react'
import { useKidJournal } from '../hooks/useKidJournal'
import { journalMoodDisplay } from '../data/journalMoods'
import { napFromJournalEntry } from '../utils/journalNap'
import { pottyDisplayLine, pottyFromJournalEntry } from '../utils/journalLittleBooks'
import { journalPostFromEntry } from '../utils/journalPost'

function hasJournalContent(entry) {
  const post = journalPostFromEntry(entry)
  const potty = pottyFromJournalEntry(entry)
  return Boolean(
    post.routeText ||
      post.title ||
      post.paragraph ||
      entry.mealsText ||
      napFromJournalEntry(entry) ||
      potty.pottyTime ||
      potty.pottyNotes ||
      entry.wishes ||
      entry.mood ||
      entry.handwrittenPhotoDataUrl
  )
}

function formatDate(dateISO) {
  if (!dateISO) return 'Undated report'
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function reportTitle(entry) {
  const post = journalPostFromEntry(entry)
  return post.title || post.paragraph || 'Day report'
}

/**
 * Read-only, family-facing view of the journal entries written by the caretaker.
 */
export default function FamilyJournalReader() {
  const { entries } = useKidJournal()
  const reports = useMemo(
    () =>
      entries
        .filter(hasJournalContent)
        .sort((a, b) =>
          `${b.dateISO ?? ''}-${b.savedAt ?? ''}`.localeCompare(`${a.dateISO ?? ''}-${a.savedAt ?? ''}`)
        ),
    [entries]
  )
  const [selectedId, setSelectedId] = useState('')
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0]
  const post = journalPostFromEntry(selected)
  const potty = pottyFromJournalEntry(selected)
  const nap = napFromJournalEntry(selected)
  const mood = journalMoodDisplay(selected?.mood)

  return (
    <section className="family-journal" aria-labelledby="family-journal-heading">
      <header className="family-journal__head">
        <div>
          <p className="family-journal__eyebrow">Shared from your caregiver</p>
          <h2 id="family-journal-heading">Today from nanny</h2>
        </div>
        <p className="family-journal__count">
          {reports.length ? `${reports.length} day report${reports.length === 1 ? '' : 's'}` : 'No reports yet'}
        </p>
      </header>

      {!selected ? (
        <div className="family-journal__empty">
          <p>Your caregiver’s day reports will appear here.</p>
          <span>Check back after the day has been logged.</span>
        </div>
      ) : (
        <div className="family-journal__content">
          {reports.length > 1 ? (
            <nav className="family-journal__report-list" aria-label="Choose a day report">
              {reports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  className={`family-journal__report-choice${
                    report.id === selected.id ? ' family-journal__report-choice--active' : ''
                  }`}
                  onClick={() => setSelectedId(report.id)}
                >
                  <span>{formatDate(report.dateISO)}</span>
                  <small>{reportTitle(report)}</small>
                </button>
              ))}
            </nav>
          ) : null}

          <article className="family-journal__report">
            <p className="family-journal__date">{formatDate(selected.dateISO)}</p>
            <div className="family-journal__title-row">
              <h3>{post.title || 'Day report'}</h3>
              {mood ? <span className="family-journal__mood">{mood}</span> : null}
            </div>
            {post.routeText ? (
              <p className="family-journal__route">
                <span>Route</span>
                {post.routeText}
              </p>
            ) : null}
            {post.paragraph ? <p className="family-journal__story">{post.paragraph}</p> : null}
            {selected.handwrittenPhotoDataUrl ? (
              <img className="family-journal__photo" src={selected.handwrittenPhotoDataUrl} alt="Handwritten day note" />
            ) : null}
            {selected.mealsText || nap || potty.pottyTime || potty.pottyNotes || selected.wishes ? (
              <dl className="family-journal__details">
                {selected.mealsText ? (
                  <div>
                    <dt>Meals</dt>
                    <dd>{selected.mealsText}</dd>
                  </div>
                ) : null}
                {nap ? (
                  <div>
                    <dt>Nap</dt>
                    <dd>{nap}</dd>
                  </div>
                ) : null}
                {potty.pottyTime || potty.pottyNotes ? (
                  <div>
                    <dt>Potty</dt>
                    <dd>{pottyDisplayLine(potty.pottyTime, potty.pottyNotes)}</dd>
                  </div>
                ) : null}
                {selected.wishes ? (
                  <div>
                    <dt>Wishes + songs</dt>
                    <dd>{selected.wishes}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </article>
        </div>
      )}
    </section>
  )
}
