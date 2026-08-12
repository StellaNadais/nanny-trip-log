import { useEffect, useState } from 'react'
import { TODAY_TILE_TYPE_MAP } from '../data/todayTileTypes'
import {
  isLikelyImageUrl,
  removeCustomTodayTile,
  updateCustomTodayTile,
} from '../utils/todayCustomTilesStorage'
import { SoftCard, softCardIcon, softCardTone } from './SoftCardPanel'

function IdeaEditor({ items, onChange, fieldClass = 'today-soft-field', fieldLabelClass = 'today-soft-field__label' }) {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')

  function addItem(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onChange([
      ...items,
      {
        id: globalThis.crypto?.randomUUID?.() ?? `idea-${Date.now()}`,
        text: trimmed,
        url: url.trim(),
        note: '',
      },
    ])
    setText('')
    setUrl('')
  }

  function removeItem(id) {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="today-custom-panel__ideas">
      {items.length > 0 ? (
        <ul className="soft-panel__grid today-custom-panel__idea-grid">
          {items.map((item, index) => (
            <SoftCard
              key={item.id}
              index={index}
              icon={softCardIcon(index)}
              tone={softCardTone(index)}
              title={item.text}
              className="soft-panel__card--custom"
            >
              {item.url ? (
                <a
                  className="today-custom-panel__idea-link"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open link ↗
                </a>
              ) : null}
              <button
                type="button"
                className="do-fun-card__remove"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.text}`}
              >
                ×
              </button>
            </SoftCard>
          ))}
        </ul>
      ) : (
        <p className="soft-panel__empty muted">No pins yet — add your first idea below.</p>
      )}

      <form className="today-custom-panel__idea-form" onSubmit={addItem}>
        <label className={fieldClass}>
          <span className={fieldLabelClass}>New idea</span>
          <input
            type="text"
            className="input input--line"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Craft, outing, recipe, activity…"
          />
        </label>
        <label className={fieldClass}>
          <span className={fieldLabelClass}>Link (optional)</span>
          <input
            type="url"
            className="input input--line"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pinterest, blog, or reference URL"
          />
        </label>
        <button type="submit" className="btn btn--ghost today-custom-panel__idea-add">
          + Pin idea
        </button>
      </form>
    </div>
  )
}

/** Editable content for a custom Today board box. */
export default function TodayCustomTilePanel({ tile, onChange, onDelete, embedded = false }) {
  const typeMeta = TODAY_TILE_TYPE_MAP[tile.type]
  const [title, setTitle] = useState(tile.title)
  const [body, setBody] = useState(tile.body ?? '')
  const [url, setUrl] = useState(tile.url ?? '')
  const [items, setItems] = useState(tile.items ?? [])

  useEffect(() => {
    setTitle(tile.title)
    setBody(tile.body ?? '')
    setUrl(tile.url ?? '')
    setItems(tile.items ?? [])
  }, [tile])

  function persist(patch) {
    const next = updateCustomTodayTile(tile.id, patch)
    if (next) onChange?.(next)
  }

  function handleTitleBlur() {
    const trimmed = title.trim()
    if (!trimmed || trimmed === tile.title) return
    persist({ title: trimmed })
  }

  function handleBodyBlur() {
    if (body === (tile.body ?? '')) return
    persist({ body })
  }

  function handleUrlBlur() {
    if (url === (tile.url ?? '')) return
    persist({ url })
  }

  function handleItemsChange(nextItems) {
    setItems(nextItems)
    persist({ items: nextItems })
  }

  function handleDelete() {
    if (!window.confirm(`Remove “${tile.title}” from your board?`)) return
    removeCustomTodayTile(tile.id)
    onDelete?.()
  }

  const showGif = tile.type === 'gif' && url && isLikelyImageUrl(url)

  const fieldClass = 'today-soft-field'
  const fieldLabelClass = 'today-soft-field__label'
  const textareaClass = 'input input--line today-soft-field__textarea today-custom-panel__note'

  return (
    <div className={`today-custom-panel today-custom-panel--${tile.type}${embedded ? ' today-custom-panel--embedded' : ''}`}>
      {!embedded ? (
        <div className="today-custom-panel__head">
          <p className="today-custom-panel__eyebrow">
            <span aria-hidden>{typeMeta?.icon}</span> {typeMeta?.eyebrow ?? typeMeta?.label}
          </p>
          <input
            type="text"
            className="today-custom-panel__title input input--line"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            aria-label="Box title"
          />
        </div>
      ) : (
        <label className={fieldClass}>
          <span className={fieldLabelClass}>Box title</span>
          <input
            type="text"
            className="input input--line"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            aria-label="Box title"
          />
        </label>
      )}

      {tile.type === 'note' ? (
        <label className={fieldClass}>
          <span className={fieldLabelClass}>Notes</span>
          <textarea
            className={textareaClass}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onBlur={handleBodyBlur}
            placeholder="Lists, reminders, quotes, anything…"
            rows={8}
          />
        </label>
      ) : null}

      {tile.type === 'link' ? (
        <>
          <label className={fieldClass}>
            <span className={fieldLabelClass}>URL</span>
            <input
              type="url"
              className="input input--line"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://…"
            />
          </label>
          {url ? (
            <a
              className="today-custom-panel__open-link"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open link ↗
            </a>
          ) : null}
          <label className={fieldClass}>
            <span className={fieldLabelClass}>Note</span>
            <textarea
              className="input input--line today-soft-field__textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onBlur={handleBodyBlur}
              placeholder="Why you saved this"
              rows={3}
            />
          </label>
        </>
      ) : null}

      {tile.type === 'gif' ? (
        <>
          <label className={fieldClass}>
            <span className={fieldLabelClass}>GIF URL</span>
            <input
              type="url"
              className="input input--line"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="Paste a direct GIF or Giphy media link"
            />
          </label>
          {showGif ? (
            <div className="today-custom-panel__gif-wrap">
              <img src={url} alt="" className="today-custom-panel__gif" loading="lazy" />
            </div>
          ) : url ? (
            <p className="muted today-custom-panel__gif-hint">
              Paste a direct image URL ending in .gif or a Giphy media link.
            </p>
          ) : null}
        </>
      ) : null}

      {tile.type === 'ideas' ? (
        <IdeaEditor items={items} onChange={handleItemsChange} fieldClass={fieldClass} fieldLabelClass={fieldLabelClass} />
      ) : null}

      <div className="today-custom-panel__foot">
        <button type="button" className="btn btn--ghost today-custom-panel__delete" onClick={handleDelete}>
          Remove box
        </button>
      </div>
    </div>
  )
}
