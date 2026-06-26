import TodayPanelModal from './TodayPanelModal'
import ScheduleCalendarFlip from './ScheduleCalendarFlip'

export default function ScheduleCalendarModal({
  open,
  onClose,
  monthLabel,
  title,
  cells,
  y,
  m,
  today,
  calendarRowCount,
  bookingsByDate,
  upcoming,
  dateISOFromParts,
  todayISO,
  isSameDay,
  cellBookingMod,
  cellBookingLabel,
  onPrevMonth,
  onNextMonth,
}) {
  if (!open) return null

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="Gig calendar"
      title="Calendar"
      dateLabel={monthLabel}
    >
      <ScheduleCalendarFlip
        title={title}
        cells={cells}
        y={y}
        m={m}
        today={today}
        calendarRowCount={calendarRowCount}
        bookingsByDate={bookingsByDate}
        upcoming={upcoming}
        dateISOFromParts={dateISOFromParts}
        todayISO={todayISO}
        isSameDay={isSameDay}
        cellBookingMod={cellBookingMod}
        cellBookingLabel={cellBookingLabel}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
    </TodayPanelModal>
  )
}
