import { Outlet, useSearchParams } from 'react-router-dom'
import NannyReceiptPopup from '../components/NannyReceiptPopup'
import WorkbookTabBar from '../components/WorkbookTabBar'

export default function WorkbookLayout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const receiptOpen = searchParams.get('receipt') === 'open'

  function openReceipt() {
    const next = new URLSearchParams(searchParams)
    next.set('receipt', 'open')
    setSearchParams(next)
  }

  function closeReceipt() {
    const next = new URLSearchParams(searchParams)
    next.delete('receipt')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className={`workbook${receiptOpen ? ' workbook--receipt-open' : ''}`}>
      <WorkbookTabBar onReceiptClick={openReceipt} receiptDisabled={receiptOpen} />
      <main className="workbook__canvas">
        <Outlet />
      </main>
      {receiptOpen ? (
        <NannyReceiptPopup
          onClose={closeReceipt}
          backdropClassName="receipt-modal__backdrop--over-hub"
        />
      ) : null}
    </div>
  )
}
