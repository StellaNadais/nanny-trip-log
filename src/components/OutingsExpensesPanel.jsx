import { categoryLabel, categoryMeta, MANUAL_CATEGORIES } from '../data/receiptManualCategories'

export default function OutingsExpensesPanel({
  extras,
  manualOpen,
  onToggleManualOpen,
  manualCat,
  onManualCatChange,
  manualAmt,
  onManualAmtChange,
  manualNote,
  onManualNoteChange,
  onAddManualLine,
  onRemoveManualLine,
  manualTotal,
}) {
  const activeCat = categoryMeta(manualCat)

  return (
    <div className="outings-expenses__panel">
      <button
        type="button"
        className={`outings-expenses__add-btn${manualOpen ? ' outings-expenses__add-btn--open' : ''}`}
        onClick={onToggleManualOpen}
        aria-expanded={manualOpen}
      >
        <span className="outings-expenses__add-btn-ico" aria-hidden>
          {manualOpen ? '−' : '+'}
        </span>
        {manualOpen ? 'Close form' : 'Add parking, tolls…'}
      </button>

      {manualOpen ? (
        <form
          className={`outings-expenses__form outings-expenses__form--${activeCat.tone}`}
          onSubmit={onAddManualLine}
        >
          <label className="field-block">
            <span className="field-block__label">Type</span>
            <select
              className="input input--line"
              value={manualCat}
              onChange={(e) => onManualCatChange(e.target.value)}
            >
              {MANUAL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-block">
            <span className="field-block__label">Amount ($)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              className="input input--line"
              value={manualAmt}
              onChange={(e) => onManualAmtChange(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          <label className="field-block">
            <span className="field-block__label">Note (optional)</span>
            <input
              type="text"
              className="input input--line"
              value={manualNote}
              onChange={(e) => onManualNoteChange(e.target.value)}
              placeholder="e.g. zoo parking"
            />
          </label>
          <button type="submit" className="btn btn--primary outings-expenses__submit">
            Add to week
          </button>
        </form>
      ) : null}

      {extras.manualLines.length > 0 ? (
        <ul className="outings-expenses__list" aria-label="Expenses this week">
          {extras.manualLines.map((m) => {
            const meta = categoryMeta(m.category)
            return (
              <li
                key={m.id}
                className={`outings-expenses__chip outings-expenses__chip--${meta.tone}`}
              >
                <div className="outings-expenses__chip-body">
                  <span className="outings-expenses__chip-type">{categoryLabel(m.category)}</span>
                  {m.note ? <span className="outings-expenses__chip-note">{m.note}</span> : null}
                </div>
                <span className="outings-expenses__chip-amt">${Number(m.amount).toFixed(2)}</span>
                <button
                  type="button"
                  className="outings-expenses__chip-remove"
                  onClick={() => onRemoveManualLine(m.id)}
                  aria-label={`Remove ${categoryLabel(m.category)} $${Number(m.amount).toFixed(2)}`}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="outings-expenses__empty muted">Nothing yet</p>
      )}

      <div className="outings-expenses__total" aria-live="polite">
        <span className="outings-expenses__total-label">Week total</span>
        <span className="outings-expenses__total-amt">${manualTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}
