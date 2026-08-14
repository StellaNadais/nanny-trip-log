import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel, TodaySoftSection } from './TodaySoftPanel'

export default function ScheduleOverviewModal({
  open,
  onClose,
  monthLabel,
  queueCount,
  confirmedCount,
  children,
}) {
  const queueLabel = queueCount === 1 ? '1 request waiting' : `${queueCount} requests waiting`
  const confirmedLabel =
    confirmedCount === 1 ? '1 gig confirmed' : `${confirmedCount} gigs confirmed`

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="Overview"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="schedule-overview-title"
        eyebrow="This month"
        title="Overview"
        meta={monthLabel}
        lede="Your gig queue at a glance — browse parent requests and respond when you're ready."
        footer="Share your booking link when you're open to more dates."
        className="soft-panel--overview"
      >
        <ul className="thanks__list thanks__list--flush schedule-overview-stats">
          <li className="thanks__item">
            <div className="thanks__item-head">
              <strong className="thanks__item-title">In queue</strong>
              <span className="schedule-overview-stats__value">{queueCount}</span>
            </div>
            <p className="thanks__item-note muted">{queueLabel}</p>
          </li>
          <li className="thanks__item">
            <div className="thanks__item-head">
              <strong className="thanks__item-title">Confirmed</strong>
              <span className="schedule-overview-stats__value">{confirmedCount}</span>
            </div>
            <p className="thanks__item-note muted">{confirmedLabel}</p>
          </li>
        </ul>

        <TodaySoftSection title="Requests" titleId="schedule-requested-dates-title">
          {children}
        </TodaySoftSection>
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
