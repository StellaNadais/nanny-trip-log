import { useState } from 'react'
import { BOOK_FAMILIES } from '../data/bookFamilies'

function inviteHref(inviteToken) {
  return new URL(`/book/i/${inviteToken}`, window.location.origin).toString()
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export default function BookInvitePanel() {
  const [copiedToken, setCopiedToken] = useState('')
  const [error, setError] = useState('')

  async function handleCopy(inviteToken) {
    try {
      await copyText(inviteHref(inviteToken))
      setCopiedToken(inviteToken)
      setError('')
    } catch {
      setError('Couldn’t copy that link. Please try again.')
    }
  }

  return (
    <section className="book-invites" aria-labelledby="book-invites-title">
      <h2 id="book-invites-title" className="book-invites__title">
        Family invitations
      </h2>
      <p className="book-invites__intro">
        Copy a private booking link to share with a family. Opening the link takes them straight
        to their booking portal.
      </p>
      {error ? (
        <p className="book-invites__error" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="book-invites__list">
        {BOOK_FAMILIES.map((family) => (
          <li key={family.inviteToken} className="book-invites__item">
            <div>
              <h3 className="book-invites__family">
                {family.lastNamePlural}
              </h3>
              <p className="book-invites__link">{inviteHref(family.inviteToken)}</p>
            </div>
            <button
              type="button"
              className="btn btn--primary book-invites__copy"
              onClick={() => handleCopy(family.inviteToken)}
            >
              {copiedToken === family.inviteToken ? 'Copied!' : 'Copy invite link'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
