/**
 * Register-tape receipt body (thermal style). Used in the modal and on-page for screenshots.
 */
export default function ReceiptThermalTicket({
  weekLabel,
  tapeSubtitle = 'Weekly receipt · register tape',
  printedAt,
  rows,
  photos,
  totalCentsDisplay,
  titleId,
  wrapId,
}) {
  return (
    <div
      className="receipt-ticket receipt-ticket--vintage"
      id={wrapId || undefined}
    >
      <div className="receipt-ticket__jagged receipt-ticket__jagged--top" aria-hidden />
      <div className="receipt-ticket__inner">
        <p className="receipt-ticket__kicker" aria-hidden>
          ========================================
        </p>
        <p className="receipt-ticket__title" id={titleId || undefined}>
          NANNY CARE
        </p>
        <p className="receipt-ticket__sub">{tapeSubtitle}</p>
        <p className="receipt-ticket__meta">{weekLabel}</p>
        {printedAt ? <p className="receipt-ticket__printed">{printedAt}</p> : null}
        <p className="receipt-ticket__store" aria-hidden>
          *** THANK YOU ***
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
  )
}
