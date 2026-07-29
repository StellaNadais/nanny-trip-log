import { useCallback, useEffect, useRef } from 'react'
import {
  applyCloudSyncData,
  CLOUD_DATA_CHANGED_EVENT,
  currentWeekExpiresAt,
  currentWeekKey,
  readCloudSyncData,
} from '../utils/cloudSync'

const SYNC_CODE = import.meta.env.VITE_NANNY_SYNC_CODE?.trim()

async function requestSync(method, body) {
  const response = await fetch(`/api/week-sync?week=${encodeURIComponent(currentWeekKey())}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      'x-nanny-sync-code': SYNC_CODE,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!response.ok) throw new Error(`Weekly sync failed (${response.status})`)
  return response.json()
}

/**
 * Cloud sync is opt-in: no requests are made unless VITE_NANNY_SYNC_CODE is configured.
 * Local storage remains the offline cache.
 */
export function CloudSyncProvider({ children }) {
  const readyRef = useRef(false)
  const pushTimerRef = useRef(null)

  const pull = useCallback(async () => {
    if (!SYNC_CODE) return
    try {
      const cloud = await requestSync('GET')
      if (cloud?.data) applyCloudSyncData(cloud.data)
    } catch (error) {
      console.warn('Could not load shared weekly data.', error)
    } finally {
      readyRef.current = true
    }
  }, [])

  const push = useCallback(async () => {
    if (!SYNC_CODE || !readyRef.current) return
    try {
      await requestSync('PUT', {
        data: readCloudSyncData(),
        expiresAt: currentWeekExpiresAt(),
      })
    } catch (error) {
      console.warn('Could not save shared weekly data.', error)
    }
  }, [])

  useEffect(() => {
    pull()
    const poll = window.setInterval(pull, 60_000)
    return () => window.clearInterval(poll)
  }, [pull])

  useEffect(() => {
    function queuePush() {
      if (!readyRef.current) return
      window.clearTimeout(pushTimerRef.current)
      pushTimerRef.current = window.setTimeout(push, 600)
    }

    window.addEventListener(CLOUD_DATA_CHANGED_EVENT, queuePush)
    return () => {
      window.removeEventListener(CLOUD_DATA_CHANGED_EVENT, queuePush)
      window.clearTimeout(pushTimerRef.current)
    }
  }, [push])

  return children
}
