import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isCaretakerUnlocked } from '../utils/caretakerAccess'

export default function CaretakerGate() {
  const location = useLocation()

  if (!isCaretakerUnlocked()) {
    return (
      <Navigate
        to="/caretaker"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    )
  }

  return <Outlet />
}
