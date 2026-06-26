import { NavLink } from 'react-router-dom'
import { receiptNavLabel } from '../utils/receiptHref'

export const WORKBOOK_TABS = [
  { to: '/schedule', label: 'Schedule', end: true },
  { to: '/shift', label: 'Shift' },
  { to: '/journal', label: 'Today' },
  { to: '/events', label: 'Events' },
]

export default function WorkbookTabBar({ onReceiptClick, receiptDisabled = false }) {
  return (
    <div className="workbook-tabs-bar" role="presentation">
      <nav className="workbook-tabs" role="tablist" aria-label="Workbook sheets">
        {WORKBOOK_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `workbook-tabs__tab${isActive ? ' workbook-tabs__tab--active' : ''}`
            }
            role="tab"
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="workbook-tabs__receipt"
        onClick={onReceiptClick}
        disabled={receiptDisabled}
      >
        {receiptNavLabel()}
      </button>
    </div>
  )
}
