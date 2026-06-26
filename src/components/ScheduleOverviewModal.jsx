import TodayPanelModal from './TodayPanelModal'

export default function ScheduleOverviewModal({
  open,
  onClose,
  monthLabel,
  queueCount,
  confirmedCount,
  children,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="This month"
      title="Overview"
      dateLabel={monthLabel}
    >
      <div className="schedule-dashboard__hud schedule-overview-modal__hud" aria-label="Schedule stats">
        <div className="schedule-dashboard__stat">
          <span className="schedule-dashboard__stat-label">Queue</span>
          <span className="schedule-dashboard__stat-value">{queueCount}</span>
        </div>
        <div className="schedule-dashboard__stat">
          <span className="schedule-dashboard__stat-label">Confirmed</span>
          <span className="schedule-dashboard__stat-value">{confirmedCount}</span>
        </div>
        <div className="schedule-dashboard__stat schedule-dashboard__stat--wide">
          <span className="schedule-dashboard__stat-label">Viewing</span>
          <span className="schedule-dashboard__stat-value">{monthLabel}</span>
        </div>
      </div>
      {children}
    </TodayPanelModal>
  )
}
