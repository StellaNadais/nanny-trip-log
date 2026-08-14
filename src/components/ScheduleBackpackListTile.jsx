import { useEffect, useState } from 'react'
import { CLOUD_DATA_APPLIED_EVENT } from '../utils/cloudSync'
import {
  loadSummerBackpack,
  SUMMER_BACKPACK_ITEMS,
  SUMMER_BACKPACK_UPDATED_EVENT,
} from '../utils/summerBackpackStorage'

/** Simple clickable box for Schedule Backpack. */
export default function ScheduleBackpackListTile({ onClick }) {
  const [packedItems, setPackedItems] = useState(loadSummerBackpack)
  const packedCount = packedItems.length
  const countLabel = `${packedCount} of ${SUMMER_BACKPACK_ITEMS.length} packed`

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

  return (
    <button type="button" className="schedule-click-box schedule-click-box--backpack" onClick={onClick}>
      <span>Backpack</span>
      <small>{countLabel}</small>
    </button>
  )
}