import { Navigate, useSearchParams } from 'react-router-dom'

/** Legacy `/receipt` URLs → Hub with receipt popup open. */
export default function WeeklyReceiptPage() {
  const [searchParams] = useSearchParams()
  const next = new URLSearchParams(searchParams)
  next.set('receipt', 'open')
  return <Navigate to={`/schedule?${next.toString()}`} replace />
}
