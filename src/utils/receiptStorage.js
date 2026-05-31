const KEY = 'nanny-receipt-settings-v1'

const DEFAULT_VENMO_HANDLE = '@stella-nadais'

const defaults = () => ({
  venmoHandle: DEFAULT_VENMO_HANDLE,
  hours: '45',
  numChildren: '1',
  weekOf: '',
  mileageByWeek: {},
  extrasByWeek: {},
})

export function loadReceiptSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults()
    const data = JSON.parse(raw)
    return {
      venmoHandle: typeof data.venmoHandle === 'string' ? data.venmoHandle : '',
      hours: typeof data.hours === 'string' ? data.hours : '45',
      numChildren: typeof data.numChildren === 'string' ? data.numChildren : '1',
      weekOf: typeof data.weekOf === 'string' ? data.weekOf : '',
      mileageByWeek:
        data.mileageByWeek && typeof data.mileageByWeek === 'object'
          ? data.mileageByWeek
          : {},
      extrasByWeek:
        data.extrasByWeek && typeof data.extrasByWeek === 'object' ? data.extrasByWeek : {},
    }
  } catch {
    return defaults()
  }
}

/** Merges into existing receipt settings (preserves other weeks’ mileage / extras). */
export function saveReceiptSettings(settings) {
  const cur = loadReceiptSettings()
  const next = {
    venmoHandle:
      typeof settings.venmoHandle === 'string' ? settings.venmoHandle : cur.venmoHandle,
    hours: typeof settings.hours === 'string' ? settings.hours : cur.hours,
    numChildren:
      typeof settings.numChildren === 'string' ? settings.numChildren : cur.numChildren,
    weekOf: typeof settings.weekOf === 'string' ? settings.weekOf : cur.weekOf,
    mileageByWeek:
      settings.mileageByWeek !== undefined
        ? { ...cur.mileageByWeek, ...settings.mileageByWeek }
        : cur.mileageByWeek,
    extrasByWeek:
      settings.extrasByWeek !== undefined
        ? { ...cur.extrasByWeek, ...settings.extrasByWeek }
        : cur.extrasByWeek,
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
}

export const RECEIPT_MILEAGE_EVENT = 'nanny-receipt-mileage'

export function notifyReceiptMileageUpdated() {
  window.dispatchEvent(new Event(RECEIPT_MILEAGE_EVENT))
}
