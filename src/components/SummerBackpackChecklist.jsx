import { useEffect, useMemo, useState } from 'react'
import { CLOUD_DATA_APPLIED_EVENT } from '../utils/cloudSync'
import {
  loadSummerBackpack,
  saveSummerBackpack,
  SUMMER_BACKPACK_ITEMS,
  SUMMER_BACKPACK_UPDATED_EVENT,
} from '../utils/summerBackpackStorage'

export default function SummerBackpackChecklist({ showHeader = true }) {
  const [packedItems, setPackedItems] = useState(loadSummerBackpack)
  const packedCount = packedItems.length
  const progressLabel = useMemo(
    () => `${packedCount} of ${SUMMER_BACKPACK_ITEMS.length} packed`,
    [packedCount]
  )

  useEffect(() => {
    function refresh() {
      setPackedItems(loadSummerBackpack())
    }

    window.addEventListener(CLOUD_DATA_APPLIED_EVENT, refresh)
    window.addEventListener(SUMMER_BACKPACK_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener(CLOUD_DATA_APPLIED_EVENT, refresh)
      window.removeEventListener(SUMMER_BACKPACK_UPDATED_EVENT, refresh)
    }
  }, [])

  function toggleItem(item) {
    setPackedItems((current) => {
      const next = current.includes(item)
        ? current.filter((packedItem) => packedItem !== item)
        : [...current, item]
      saveSummerBackpack(next)
      return next
    })
  }

  return (
    <section
      className="summer-backpack"
      aria-labelledby={showHeader ? 'summer-backpack-title' : undefined}
      aria-label={showHeader ? undefined : 'Summer backpack checklist'}
    >
      {showHeader ? (
        <div className="summer-backpack__head">
          <div>
            <h2 id="summer-backpack-title">Summer day pack</h2>
            <p>Pack it before heading out.</p>
          </div>
          <span className="summer-backpack__count" aria-label={progressLabel}>
            {progressLabel}
          </span>
        </div>
      ) : (
        <p className="summer-backpack__progress muted">{progressLabel}</p>
      )}
      <ul className="thanks__list thanks__list--flush summer-backpack__list">
        {SUMMER_BACKPACK_ITEMS.map((item) => {
          const packed = packedItems.includes(item)
          return (
            <li
              key={item}
              className={
                packed ? 'thanks__item summer-backpack__item summer-backpack__item--packed' : 'thanks__item summer-backpack__item'
              }
            >
              <label className="thanks__item-head summer-backpack__label">
                <input
                  type="checkbox"
                  checked={packed}
                  onChange={() => toggleItem(item)}
                />
                <strong className="thanks__item-title">{item}</strong>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
