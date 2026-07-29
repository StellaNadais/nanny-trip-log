import { createHash, timingSafeEqual } from 'node:crypto'
import { Buffer } from 'node:buffer'
import process from 'node:process'

const MAX_PAYLOAD_BYTES = 500_000
const MAX_TTL_SECONDS = 8 * 24 * 60 * 60

function equalCodes(a, b) {
  const left = Buffer.from(String(a || ''))
  const right = Buffer.from(String(b || ''))
  return left.length === right.length && timingSafeEqual(left, right)
}

function validWeekKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

async function redis(command) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  if (!response.ok) throw new Error(`Redis request failed (${response.status})`)
  const result = await response.json()
  if (result.error) throw new Error(result.error)
  return result.result
}

export default async function handler(request, response) {
  const syncCode = process.env.NANNY_SYNC_CODE
  if (
    !syncCode ||
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return response.status(503).json({ error: 'Weekly sync is not configured.' })
  }

  if (!equalCodes(request.headers['x-nanny-sync-code'], syncCode)) {
    return response.status(401).json({ error: 'Weekly sync is not authorized.' })
  }

  const week = Array.isArray(request.query.week) ? request.query.week[0] : request.query.week
  if (!validWeekKey(week)) return response.status(400).json({ error: 'Invalid week.' })

  const groupId = createHash('sha256').update(syncCode).digest('hex').slice(0, 32)
  const key = `nanny-trip-log:${groupId}:${week}`

  try {
    if (request.method === 'GET') {
      const saved = await redis(['GET', key])
      const record = saved ? JSON.parse(saved) : null
      return response.status(200).json({ data: record?.data ?? null })
    }

    if (request.method !== 'PUT') {
      response.setHeader('Allow', 'GET, PUT')
      return response.status(405).json({ error: 'Method not allowed.' })
    }

    const { data, expiresAt } = request.body || {}
    const encoded = JSON.stringify(data)
    if (!data || typeof data !== 'object' || Array.isArray(data) || encoded.length > MAX_PAYLOAD_BYTES) {
      return response.status(400).json({ error: 'Invalid sync payload.' })
    }

    const requestedExpiry = new Date(expiresAt).getTime()
    const ttl = Math.min(
      MAX_TTL_SECONDS,
      Math.max(60, Math.floor((requestedExpiry - Date.now()) / 1000))
    )
    await redis(['SET', key, JSON.stringify({ data }), 'EX', String(ttl)])
    return response.status(200).json({ ok: true })
  } catch (error) {
    console.error('Weekly sync failed', error)
    return response.status(500).json({ error: 'Weekly sync is temporarily unavailable.' })
  }
}
