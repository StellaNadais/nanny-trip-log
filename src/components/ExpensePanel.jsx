import { useMemo, useState } from 'react'

export function ExpensePanel({ expenses, onAdd, onRemove }) {
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')

  const total = useMemo(
    () => expenses.reduce((s, x) => s + x.amount, 0),
    [expenses]
  )

  function submit(e) {
    e.preventDefault()
    onAdd(label, amount)
    setLabel('')
    setAmount('')
  }

  return (
    <div className="side-panel">
      <form className="expense-form" onSubmit={submit}>
        <input
          type="text"
          className="input input--line"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="What (snacks, miles, tickets…)"
          aria-label="Expense description"
        />
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          className="input input--line input--narrow"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          aria-label="Amount"
        />
        <button type="submit" className="btn btn--primary">
          Add
        </button>
      </form>
      <ul className="expense-list">
        {expenses.length === 0 && (
          <li className="muted">Track reimbursable costs for the week here.</li>
        )}
        {expenses.map((x) => (
          <li key={x.id} className="expense-row">
            <span className="expense-label">{x.label}</span>
            <span className="expense-amt">
              ${x.amount.toFixed(2)}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => onRemove(x.id)}
              aria-label={`Remove ${x.label}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {expenses.length > 0 && (
        <p className="expense-total">
          Week total: <strong>${total.toFixed(2)}</strong>
        </p>
      )}
    </div>
  )
}
