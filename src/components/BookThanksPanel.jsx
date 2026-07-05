import { BOOK_THANKS_FOOTER, BOOK_THANKS_LEDE, BOOK_THANKS_SUPPORTERS } from '../data/bookThanks'

export default function BookThanksPanel() {
  return (
    <section className="soft-panel soft-panel--thanks" aria-labelledby="book-thanks-heading">
      <div className="soft-panel__hero">
        <p className="soft-panel__eyebrow">With gratitude</p>
        <h2 id="book-thanks-heading" className="soft-panel__title">
          Thank you
        </h2>
        <p className="soft-panel__lede">{BOOK_THANKS_LEDE}</p>
      </div>

      <ul className="thanks__list thanks__list--flush">
        {BOOK_THANKS_SUPPORTERS.map((person) => (
          <li key={person.name} className="thanks__item">
            <div className="thanks__item-head">
              <span className="thanks__item-icon" aria-hidden>
                {person.icon}
              </span>
              <strong className="thanks__item-title">{person.name}</strong>
            </div>
            <p className="thanks__item-note muted">{person.note}</p>
          </li>
        ))}
      </ul>

      <p className="soft-panel__footer">{BOOK_THANKS_FOOTER}</p>
    </section>
  )
}
