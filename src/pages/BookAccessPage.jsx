/**
 * /book — invitation link landing page.
 */
export default function BookAccessPage() {
  return (
    <div className="page page--book page--book-portal page--book-access work-ui">
      <header className="book-access__head">
        <p className="book-access__eyebrow">Parent & family portal</p>
        <h1 className="book-access__title">Use your invitation link</h1>
      </header>

      <div className="book-access__stage">
        <div className="book-access">
          <section className="book-access__message" aria-label="Invitation link required">
            <p>Open the booking link shared with your family to request care.</p>
            <p className="muted">
              Need the link again? Please ask Stella to send it to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
