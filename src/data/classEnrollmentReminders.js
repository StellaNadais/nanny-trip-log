/**
 * School-year enrollment “start looking” windows (typical US Aug/Sept start).
 * Months are 1–12. Windows may wrap the calendar year (e.g. Nov–Jan).
 *
 * @typedef {'ballet' | 'gymnastics' | 'music' | 'camps'} EnrollmentActivity
 * @typedef {'fall' | 'winter-spring' | 'summer' | 'mid-year' | 'holiday'} EnrollmentSeason
 * @typedef {{
 *   id: string,
 *   activity: EnrollmentActivity,
 *   season: EnrollmentSeason,
 *   lookStartMonth: number,
 *   lookEndMonth: number,
 *   title: string,
 *   detail: string,
 * }} ClassEnrollmentReminder
 */

/** @type {ClassEnrollmentReminder[]} */
export const CLASS_ENROLLMENT_REMINDERS = [
  {
    id: 'ballet-fall',
    activity: 'ballet',
    season: 'fall',
    lookStartMonth: 5,
    lookEndMonth: 8,
    title: 'Fall ballet classes',
    detail: 'Studios open fall registration late spring through summer. Popular levels fill before school starts.',
  },
  {
    id: 'gymnastics-fall',
    activity: 'gymnastics',
    season: 'fall',
    lookStartMonth: 5,
    lookEndMonth: 8,
    title: 'Fall gymnastics classes',
    detail: 'Gyms fill fall recreational and competitive spots through summer. Tour and waitlists early.',
  },
  {
    id: 'music-fall',
    activity: 'music',
    season: 'fall',
    lookStartMonth: 5,
    lookEndMonth: 8,
    title: 'Fall music & instrument lessons',
    detail: 'Private teachers and schools book fall slots May–August. Ask about trial lessons before term.',
  },
  {
    id: 'ballet-winter-spring',
    activity: 'ballet',
    season: 'winter-spring',
    lookStartMonth: 11,
    lookEndMonth: 1,
    title: 'Winter / spring ballet',
    detail: 'Many studios open winter–spring sessions in November–January. Check mid-year placement too.',
  },
  {
    id: 'gymnastics-winter-spring',
    activity: 'gymnastics',
    season: 'winter-spring',
    lookStartMonth: 11,
    lookEndMonth: 1,
    title: 'Winter / spring gymnastics',
    detail: 'Look for January session openings and make-up spots while fall classes wrap up.',
  },
  {
    id: 'music-winter-spring',
    activity: 'music',
    season: 'winter-spring',
    lookStartMonth: 11,
    lookEndMonth: 1,
    title: 'Winter / spring music lessons',
    detail: 'Teachers often reshuffle after holidays. Good window to start or switch instruments.',
  },
  {
    id: 'camps-summer-early',
    activity: 'camps',
    season: 'summer',
    lookStartMonth: 1,
    lookEndMonth: 3,
    title: 'Summer camps — enroll early',
    detail: 'Popular day camps and specialty weeks fill January–March. Compare dates with family travel.',
  },
  {
    id: 'camps-summer-late',
    activity: 'camps',
    season: 'summer',
    lookStartMonth: 4,
    lookEndMonth: 5,
    title: 'Summer camps — last call',
    detail: 'Late openings and waitlist movement often appear in April–May. Confirm deposits and pickup times.',
  },
  {
    id: 'camps-holiday',
    activity: 'camps',
    season: 'holiday',
    lookStartMonth: 10,
    lookEndMonth: 11,
    title: 'Winter break & holiday camps',
    detail: 'School-break camps open in fall. Book before holiday travel plans lock in.',
  },
  {
    id: 'classes-midyear',
    activity: 'ballet',
    season: 'mid-year',
    lookStartMonth: 9,
    lookEndMonth: 10,
    title: 'Mid-year class openings',
    detail: 'After school starts, some ballet, gym, and music studios free spots or add sections. Worth a quick check.',
  },
]

const ACTIVITY_ORDER = { ballet: 0, gymnastics: 1, music: 2, camps: 3 }

/**
 * Whether calendar month (1–12) falls in a look window (inclusive; may wrap year).
 * @param {number} month 1–12
 * @param {number} lookStartMonth 1–12
 * @param {number} lookEndMonth 1–12
 */
export function monthInLookWindow(month, lookStartMonth, lookEndMonth) {
  if (lookStartMonth <= lookEndMonth) {
    return month >= lookStartMonth && month <= lookEndMonth
  }
  return month >= lookStartMonth || month <= lookEndMonth
}

/**
 * Short label for the look window, e.g. "May–Aug" or "Nov–Jan".
 * @param {ClassEnrollmentReminder} reminder
 */
export function enrollmentWindowLabel(reminder) {
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const a = names[reminder.lookStartMonth]
  const b = names[reminder.lookEndMonth]
  return a === b ? a : `${a}–${b}`
}

/**
 * Reminders whose look window includes this calendar month.
 * @param {number} monthIndex 0–11
 * @param {ClassEnrollmentReminder[]} [source]
 */
export function enrollmentRemindersForMonth(
  monthIndex,
  source = CLASS_ENROLLMENT_REMINDERS
) {
  const month = monthIndex + 1
  return source
    .filter((r) => monthInLookWindow(month, r.lookStartMonth, r.lookEndMonth))
    .sort((a, b) => {
      const byActivity = (ACTIVITY_ORDER[a.activity] ?? 9) - (ACTIVITY_ORDER[b.activity] ?? 9)
      if (byActivity !== 0) return byActivity
      return a.title.localeCompare(b.title)
    })
    .map((r) => ({
      ...r,
      windowLabel: enrollmentWindowLabel(r),
    }))
}

/**
 * @param {Date} [date]
 */
export function enrollmentRemindersForToday(date = new Date()) {
  return enrollmentRemindersForMonth(date.getMonth())
}
