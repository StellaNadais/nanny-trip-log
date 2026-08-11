import { useEffect, useMemo, useState } from 'react'
import { CLOUD_DATA_APPLIED_EVENT } from '../utils/cloudSync'
import {
  loadSummerBackpack,
  saveSummerBackpack,
  SUMMER_BACKPACK_ITEMS,
} from '../utils/summerBackpackStorage'

export default function SummerBackpackChecklist({ showHeader = true }) {
  const [packedItems, setPackedItems] = useState(loadSummerBackpack)
  const packedCount = packedItems.length
  const progressLabel = useMemo(
    () => `${packedCount} of ${SUMMER_BACKPACK_ITEMS.length} packed`,
    [packedCount]
  )

  useEffect(() => {
    function refreshFromCloud() {
      setPackedItems(loadSummerBackpack())
    }

    window.addEventListener(CLOUD_DATA_APPLIED_EVENT, refreshFromCloud)
    return () => window.removeEventListener(CLOUD_DATA_APPLIED_EVENT, refreshFromCloud)
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
      ) : null}
      <ul className="summer-backpack__list">
        {SUMMER_BACKPACK_ITEMS.map((item) => {
          const packed = packedItems.includes(item)
          return (
            <li key={item} className={packed ? 'summer-backpack__item summer-backpack__item--packed' : 'summer-backpack__item'}>
              <label>
                <input
                  type="checkbox"
                  checked={packed}
                  onChange={() => toggleItem(item)}
                />
                <span>{item}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
