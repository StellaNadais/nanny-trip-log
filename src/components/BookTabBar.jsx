const BOOK_TABS = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'events', label: 'Events' },
  { id: 'thanks', label: 'Thank you' },
]

export default function BookTabBar({ activeTab, onTabChange }) {
  return (
    <div className="workbook-tabs-bar book-portal-tabs" role="presentation">
      <nav className="workbook-tabs" role="tablist" aria-label="Parent booking sections">
        {BOOK_TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`workbook-tabs__tab${active ? ' workbook-tabs__tab--active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
