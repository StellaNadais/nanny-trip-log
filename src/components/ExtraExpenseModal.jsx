import { useEffect, useId, useState } from 'react'
import { MANUAL_CATEGORIES } from '../data/receiptManualCategories'
import {
  loadReceiptSettings,
  saveReceiptSettings,
  notifyReceiptMileageUpdated,
} from '../utils/receiptStorage'

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeExtrasRow(row) {
  if (row && Array.isArray(row.photos) && Array.isArray(row.manualLines)) {
    return { photos: row.photos, manualLines: row.manualLines }
  }
  return { photos: [], manualLines: [] }
}

/**
 * Adds a manual reimbursement line for the receipt week (same storage as Outings page).
 */
export default function ExtraExpenseModal({ open, onClose, receiptWeekKey }) {
  const titleId = useId()
  const [cat, setCat] = useState('parking_ticket')
  const [amt, setAmt] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    setCat('parking_ticket')
    setAmt('')
    setNote('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open || !receiptWeekKey) return null

  function submit(e) {
    e.preventDefault()
    const parsed = parseFloat(amt)
    if (!Number.isFinite(parsed) || parsed < 0) return
    const cur = loadReceiptSettings()
    const base = normalizeExtrasRow(cur.extrasByWeek?.[receiptWeekKey])
    const nextLine = {
      id: uid(),
      category: cat,
      note: note.trim(),
      amount: Math.round(parsed * 100) / 100,
    }
    saveReceiptSettings({
      extrasByWeek: {
        ...cur.extrasByWeek,
        [receiptWeekKey]: {
          ...base,
          manualLines: [...base.manualLines, nextLine],
        },
      },
    })
    notifyReceiptMileageUpdated()
    onClose()
  }

  return (
    <div className="extra-expense-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="extra-expense-modal__backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="extra-expense-modal__sheet">
        <h2 id={titleId} className="extra-expense-modal__title">
          Add expense
        </h2>
        <form className="extra-expense-modal__form" onSubmit={submit}>
          <label className="field-block">
            <span className="field-block__label">Type</span>
            <select className="input input--line" value={cat} onChange={(e) => setCat(e.target.value)}>
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
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              placeholder="0.00"
              required
              autoComplete="off"
            />
          </label>
          <label className="field-block">
            <span className="field-block__label">Note (optional)</span>
            <input
              type="text"
              className="input input--line"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. garage on Oak"
              autoComplete="off"
            />
          </label>
          <div className="extra-expense-modal__actions">
            <button type="button" className="btn btn--ghost extra-expense-modal__cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Add to receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
