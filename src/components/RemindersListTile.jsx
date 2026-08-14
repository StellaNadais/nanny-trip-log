function quickTasksSummary(reminderCount, groceryCount, errandCount) {
  const notes = reminderCount
    ? `${reminderCount} note${reminderCount === 1 ? '' : 's'}`
    : null
  const errands = errandCount
    ? `${errandCount} errand${errandCount === 1 ? '' : 's'}`
    : null
  const grocery = groceryCount
    ? `${groceryCount} to get`
    : null
  return [notes, errands, grocery].filter(Boolean).join(' · ') || 'Nothing pending'
}

/** Schedule-style click box for Today Quick tasks. */
export default function RemindersListTile({
  reminderCount = 0,
  groceryCount = 0,
  errandCount = 0,
  onClick,
}) {
  return (
    <button type="button" className="schedule-click-box" onClick={onClick}>
      <span>Quick tasks</span>
      <small>{quickTasksSummary(reminderCount, groceryCount, errandCount)}</small>
    </button>
  )
}
