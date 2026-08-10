import { useMemo } from 'react'
import { splitTripLogForMirror } from '../utils/parseTripPlaces'
import { journalPostFromEntry, stripLeadingRoutePlaces } from '../utils/journalPost'

function compactValue(...values) {
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' · ')
}

function routePlaces(dayNotes) {
  return splitTripLogForMirror(dayNotes)
    .filter((chunk) => (chunk.type === 'place' || chunk.type === 'token') && chunk.place)
    .map((chunk) => ({
      id: chunk.place.id,
      label: chunk.value,
      region: chunk.place.region || 'unknown',
    }))
}

function briefSummary(paragraph, route) {
  const text = String(paragraph || '').replace(/\s+/g, ' ').trim()
  const withoutRoutePrefix = stripLeadingRoutePlaces(
    text,
    route.map((place) => place.id)
  )
  if (withoutRoutePrefix.length <= 280) return withoutRoutePrefix
  return `${withoutRoutePrefix.slice(0, 277).trimEnd()}…`
}

/**
 * A readable, at-a-glance daily journal that links into the full report.
 */
export default function TodayJournalPreview({
  dateLabel,
  dayNotes,
  routeText,
  title,
  paragraph,
  mealsText,
  nap,
  pottyTime,
  pottyNotes,
  wishes,
  onOpen,
  onOpenReminders,
  onOpenOutings,
  reminderCount,
  groceryCount,
}) {
  const post = useMemo(
    () => journalPostFromEntry({ dayNotes, routeText, title, paragraph }),
    [dayNotes, routeText, title, paragraph]
  )
  const potty = compactValue(pottyTime, pottyNotes)
  const routeSource = post.routeText || dayNotes
  const route = useMemo(() => routePlaces(routeSource), [routeSource])
  const summary = useMemo(
    () => briefSummary(post.paragraph, route),
    [post.paragraph, route]
  )
  const meals = String(mealsText || '').trim()
  const hasJournal = Boolean(post.routeText || post.title || post.paragraph || meals || potty || nap || wishes)

  return (
    <article className="today-journal-preview" aria-label={`Journal preview for ${dateLabel}`}>
      <button type="button" className="today-journal-preview__story" onClick={onOpen}>
        {hasJournal ? (
          <>
            <section className="today-journal-preview__route" aria-label="Today’s route">
              {route.length ? (
                <ol className="today-journal-preview__route-list">
                  {route.map((place, index) => (
                    <li key={`${place.label}-${index}`}>
                      <span className={`today-journal-preview__place-pill trip-place--${place.region}`}>
                        {String(place.label).toLocaleLowerCase()}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="today-journal-preview__route-empty">
                  Add a familiar place to the journal to outline today&apos;s route.
                </p>
              )}
            </section>

            {post.title ? <h3 className="today-journal-preview__opening">{post.title}</h3> : null}

            <section className="today-journal-preview__summary" aria-label="Rest of today’s journal">
              {summary ? <p>{summary}</p> : null}
              {meals ? (
                <p className="today-journal-preview__meals">
                  <span>Meals:</span> {meals}
                </p>
              ) : null}
              {wishes ? (
                <p className="today-journal-preview__wishes">
                  <span>Wishes:</span> {wishes}
                </p>
              ) : null}
              {!summary && !meals && !wishes ? <p>The journal details are recorded below.</p> : null}
            </section>

            <dl className="today-journal-preview__details" aria-label="Potty and nap">
              <div>
                <dt>Poop</dt>
                <dd>{potty || 'Not noted'}</dd>
              </div>
              <div>
                <dt>Nap</dt>
                <dd>{nap || 'Not noted'}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="today-journal-preview__empty">
            <p>Nothing has been recorded for this day yet.</p>
            <span>Open the report and begin with a first sentence. It will become today&apos;s lead.</span>
          </div>
        )}
      </button>

      <footer className="today-journal-preview__links" aria-label="Today’s supporting tools">
        <button type="button" className="today-journal-preview__tool-card" onClick={onOpenReminders}>
          <span>Notes &amp; reminders</span>
          <small>
            {reminderCount || groceryCount
              ? `${reminderCount} note${reminderCount === 1 ? '' : 's'} / reminder${reminderCount === 1 ? '' : 's'}${groceryCount ? ` · ${groceryCount} grocery` : ''}`
              : 'Nothing pending'}
          </small>
        </button>
        <button type="button" onClick={onOpenOutings}>
          <span>Outings</span>
          <small>$ expenses &amp; mileage</small>
        </button>
      </footer>

      <section className="today-journal-preview__handoff" aria-labelledby="today-handoff-heading">
        <div>
          <p className="today-journal-preview__handoff-eyebrow">Family handoff</p>
          <h2 id="today-handoff-heading">Keep pickup easy</h2>
          <p>
            {hasJournal
              ? 'Today’s report is ready for the next conversation.'
              : 'Add a few details now so pickup feels easy later.'}
          </p>
        </div>
        <button type="button" onClick={onOpen}>
          Open report
        </button>
      </section>

      <footer className="today-journal-preview__site-footer">
        <span>carekidsmiles</span>
        <small>Care days, clearly shared.</small>
      </footer>
    </article>
  )
}
