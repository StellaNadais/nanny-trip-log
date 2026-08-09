import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  applyCloudSyncData,
  CLOUD_DATA_CHANGED_EVENT,
  readCloudSyncData,
} from '../utils/cloudSync'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim()
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const WORKSPACE_ID = import.meta.env.VITE_NANNY_SYNC_CODE?.trim()
const isConfigured =
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && WORKSPACE_ID) &&
  ![SUPABASE_URL, SUPABASE_ANON_KEY, WORKSPACE_ID].some((value) =>
    value.includes('replace-with')
  )

const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

/**
 * Supabase holds one persistent, shared household document. Local storage remains
 * the offline cache and a long shared workspace code identifies that document.
 */
export function CloudSyncProvider({ children }) {
  const readyRef = useRef(false)
  const pushTimerRef = useRef(null)
  const [loaded, setLoaded] = useState(() => !supabase)

  const pull = useCallback(async () => {
    if (!supabase) return false
    try {
      const { data, error } = await supabase.rpc('get_nanny_shared_data', {
        p_workspace_code: WORKSPACE_ID,
      })
      if (error) throw error
      if (data && Object.keys(data).length) applyCloudSyncData(data)
      return Boolean(data && Object.keys(data).length)
    } catch (error) {
      console.warn('Could not load shared Supabase data.', error)
      return false
    } finally {
      readyRef.current = true
    }
  }, [])

  const push = useCallback(async () => {
    if (!supabase || !readyRef.current) return
    try {
      const { error } = await supabase.rpc('save_nanny_shared_data', {
        p_workspace_code: WORKSPACE_ID,
        p_data: readCloudSyncData(),
      })
      if (error) throw error
    } catch (error) {
      console.warn('Could not save shared Supabase data.', error)
    }
  }, [])

  useEffect(() => {
    async function loadInitialData() {
      const foundCloudData = await pull()
      if (!foundCloudData) push()
      setLoaded(true)
    }
    loadInitialData()
    const poll = window.setInterval(pull, 60_000)
    return () => window.clearInterval(poll)
  }, [pull, push])

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

  return loaded ? children : null
}
