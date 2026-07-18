import { useState } from 'react'
import { Link } from 'react-router-dom'
import { checkFamilyPassword } from '../data/bookFamilies'
import { unlockBookFamily } from '../utils/bookFamilyAccess'

/**
 * Password gate for a single family portal (/book/:family).
 */
export default function BookFamilyGate({ family, onUnlocked }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const year = new Date().getFullYear()

  function handleSubmit(e) {
    e.preventDefault()
    if (!checkFamilyPassword(family, password, year)) {
      setError('That password doesn’t match.')
      return
    }
    unlockBookFamily(family.slug)
    onUnlocked?.()
  }

  return (
    <div className="page page--book page--book-portal page--book-access work-ui">
      <div className="book-access">
        <header className="book-access__head">
          <p className="book-access__eyebrow">Parent & family portal</p>
          <h1 className="book-access__title">Password</h1>
        </header>

        <form className="book-access__form" onSubmit={handleSubmit}>
          <label className="field-block">
            <span className="field-block__label">Password</span>
            <input
              type="password"
              className="input input--line"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {error ? (
            <p className="book-access__error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn--primary book-access__submit">
            Continue
          </button>
        </form>

        <Link to="/book" className="book-access__back">
          ← Start over
        </Link>
      </div>
    </div>
  )
}
