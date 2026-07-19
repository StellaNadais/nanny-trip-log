import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkFamilyPassword, getBookFamily } from '../data/bookFamilies'
import { unlockBookFamily } from '../utils/bookFamilyAccess'

/**
 * /book — type family nickname, then password.
 */
export default function BookAccessPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('nickname')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [family, setFamily] = useState(null)
  const [error, setError] = useState('')

  const year = new Date().getFullYear()

  function handleNicknameSubmit(e) {
    e.preventDefault()
    const match = getBookFamily(nickname)
    if (!match) {
      setError('That nickname wasn’t found. Try again.')
      return
    }
    setFamily(match)
    setPassword('')
    setError('')
    setStep('password')
  }

  function handlePasswordSubmit(e) {
    e.preventDefault()
    if (!family) return
    if (!checkFamilyPassword(family, password, year)) {
      setError('That password doesn’t match.')
      return
    }
    unlockBookFamily(family.slug)
    navigate(`/book/${family.slug}`)
  }

  function goBackToNickname() {
    setStep('nickname')
    setPassword('')
    setFamily(null)
    setError('')
  }

  return (
    <div
      className={`page page--book page--book-portal page--book-access work-ui${
        step === 'nickname' ? ' page--book-access--nickname' : ''
      }`}
    >
      <header className="book-access__head">
        <p className="book-access__eyebrow">Parent & family portal</p>
        {step === 'password' ? <h1 className="book-access__title">Password</h1> : null}
      </header>

      <div className="book-access__stage">
        <div className="book-access">
          {step === 'nickname' ? (
            <form className="book-access__form" onSubmit={handleNicknameSubmit}>
              <label className="field-block">
                <span className="field-block__label">Type your family nickname</span>
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
              {error ? (
                <p className="book-access__error" role="alert">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="btn btn--primary book-access__submit">
                Continue
              </button>
            </form>
          ) : (
            <form className="book-access__form" onSubmit={handlePasswordSubmit}>
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
              <button
                type="button"
                className="btn btn--ghost book-access__back-btn"
                onClick={goBackToNickname}
              >
                Use a different nickname
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
