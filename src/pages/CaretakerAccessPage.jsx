import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { checkCaretakerCredentials } from '../data/caretakerCredentials'
import { unlockCaretaker } from '../utils/caretakerAccess'

export default function CaretakerAccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!checkCaretakerCredentials(nickname, password)) {
      setError('That nickname or password doesn’t match.')
      return
    }

    unlockCaretaker()
    navigate(location.state?.from ?? '/schedule', { replace: true })
  }

  return (
    <div className="page page--book page--book-portal page--book-access work-ui">
      <header className="book-access__head">
        <p className="book-access__eyebrow">Caretaker access</p>
        <h1 className="book-access__title">Welcome back</h1>
      </header>

      <div className="book-access__stage">
        <div className="book-access">
          <form className="book-access__form" onSubmit={handleSubmit}>
            <label className="field-block">
              <span className="field-block__label">Caretaker nickname</span>
              <input
                type="text"
                className="input input--line"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setError('')
                }}
                autoComplete="username"
                autoFocus
                required
              />
            </label>
            <label className="field-block">
              <span className="field-block__label">Last-name password</span>
              <input
                type="password"
                className="input input--line"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                autoComplete="current-password"
                required
              />
            </label>
            {error ? (
              <p className="book-access__error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn btn--primary book-access__submit">
              Open schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
