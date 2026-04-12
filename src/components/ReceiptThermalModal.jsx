import { useEffect } from 'react'

/**
 * Traditional narrow “printed receipt” popup.
 */
export default function ReceiptThermalModal({
  open,
  onClose,
  weekLabel,
  printedAt,
  rows,
  photos,
  totalCentsDisplay,
  children,
}) {
  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-thermal-title">
      <button type="button" className="receipt-modal__backdrop" aria-label="Close receipt" onClick={onClose} />
      <div className="receipt-modal__sheet">
        <div className="receipt-ticket receipt-ticket--vintage">
          <div className="receipt-ticket__jagged receipt-ticket__jagged--top" aria-hidden />
          <div className="receipt-ticket__inner">
            <p className="receipt-ticket__kicker" aria-hidden>
              ========================================
            </p>
            <p className="receipt-ticket__title" id="receipt-thermal-title">
              NANNY CARE
            </p>
            <p className="receipt-ticket__sub">Weekly receipt · register tape</p>
            <p className="receipt-ticket__meta">{weekLabel}</p>
            {printedAt ? <p className="receipt-ticket__printed">{printedAt}</p> : null}
            <p className="receipt-ticket__store" aria-hidden>
              *** THANK YOU ***<br />
              NO REFUNDS ON LOVE
            </p>
            <div className="receipt-ticket__rule" />
            <ul className="receipt-ticket__lines">
              {rows.map((r, i) => (
                <li key={i} className="receipt-ticket__line">
                  <span className="receipt-ticket__desc">{r.desc}</span>
                  <span className="receipt-ticket__amt">{r.amt}</span>
                </li>
              ))}
            </ul>
            {photos?.length > 0 ? (
              <>
                <div className="receipt-ticket__rule" />
                <p className="receipt-ticket__snap-hdr">Receipt photos</p>
                <div className="receipt-ticket__photos">
                  {photos.map((p) => (
                    <figure key={p.id} className="receipt-ticket__fig">
                      <img src={p.dataUrl} alt="" className="receipt-ticket__img" />
                    </figure>
                  ))}
                </div>
              </>
            ) : null}
            <div className="receipt-ticket__rule receipt-ticket__rule--bold" />
            <div className="receipt-ticket__total-row">
              <span>TOTAL DUE</span>
              <span>{totalCentsDisplay}</span>
            </div>
            <p className="receipt-ticket__thanks">Thank you!</p>
            <div className="receipt-ticket__rule" />
          </div>
          <div className="receipt-ticket__jagged receipt-ticket__jagged--bottom" aria-hidden />
        </div>
        <div className="receipt-modal__actions">{children}</div>
        <button type="button" className="btn btn--ghost receipt-modal__close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
