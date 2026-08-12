import { useState } from 'react'
import { TODAY_TILE_TYPES, todayTileAccent } from '../data/todayTileTypes'
import { addCustomTodayTile, loadCustomTodayTiles } from '../utils/todayCustomTilesStorage'
import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel } from './TodaySoftPanel'

function TypePicker({ onPick }) {
  return (
    <ul className="thanks__list thanks__list--flush today-add-tile__type-list">
      {TODAY_TILE_TYPES.map((type) => (
        <li key={type.id} className="thanks__item">
          <button type="button" className="today-add-tile__type-row" onClick={() => onPick(type.id)}>
            <div className="thanks__item-head">
              <span className="thanks__item-icon" aria-hidden>
                {type.icon}
              </span>
              <strong className="thanks__item-title">{type.label}</strong>
            </div>
            <p className="thanks__item-note muted">{type.hint}</p>
          </button>
        </li>
      ))}
    </ul>
  )
}

function CreateForm({ typeId, onBack, onCreated, onClose }) {
  const typeMeta = TODAY_TILE_TYPES.find((t) => t.id === typeId)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [firstIdea, setFirstIdea] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle || !typeId) return

    const existing = loadCustomTodayTiles()
    const accent = todayTileAccent(existing.length)

    const payload = {
      type: typeId,
      title: trimmedTitle,
      accent,
      body: body.trim(),
      url: url.trim(),
      items: [],
    }

    if (typeId === 'ideas' && firstIdea.trim()) {
      payload.items = [{ id: `idea-${Date.now()}`, text: firstIdea.trim(), url: '', note: '' }]
    }

    const created = addCustomTodayTile(payload)
    if (created) {
      onCreated?.(created.id)
      onClose()
    }
  }

  return (
    <form className="today-add-tile__form" onSubmit={handleSubmit}>
      <button type="button" className="btn btn--ghost today-add-tile__back" onClick={onBack}>
        ← Types
      </button>
      <p className="today-add-tile__type-label">
        <span aria-hidden>{typeMeta?.icon}</span> {typeMeta?.label}
      </p>

      <label className="today-soft-field">
        <span className="today-soft-field__label">Box title</span>
        <input
          type="text"
          className="input input--line"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            typeId === 'note'
              ? 'e.g. Afternoon plan'
              : typeId === 'link'
                ? 'e.g. Sensory play article'
                : typeId === 'gif'
                  ? 'e.g. Friday mood'
                  : 'e.g. Summer craft ideas'
          }
          required
          autoFocus
        />
      </label>

      {typeId === 'note' ? (
        <label className="today-soft-field">
          <span className="today-soft-field__label">Note (optional)</span>
          <textarea
            className="input input--line today-soft-field__textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write anything — list, reminder, quote…"
            rows={4}
          />
        </label>
      ) : null}

      {typeId === 'link' || typeId === 'gif' ? (
        <label className="today-soft-field">
          <span className="today-soft-field__label">
            {typeId === 'gif' ? 'GIF URL' : 'Link URL'}
          </span>
          <input
            type="url"
            className="input input--line"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={typeId === 'gif' ? 'https://…/image.gif' : 'https://…'}
          />
        </label>
      ) : null}

      {typeId === 'link' ? (
        <label className="today-soft-field">
          <span className="today-soft-field__label">Note (optional)</span>
          <input
            type="text"
            className="input input--line"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Why you saved this"
          />
        </label>
      ) : null}

      {typeId === 'ideas' ? (
        <label className="today-soft-field">
          <span className="today-soft-field__label">First idea (optional)</span>
          <input
            type="text"
            className="input input--line"
            value={firstIdea}
            onChange={(e) => setFirstIdea(e.target.value)}
            placeholder="e.g. Paper plate sun craft"
          />
        </label>
      ) : null}

      <div className="soft-panel__actions today-add-tile__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          Add to board
        </button>
      </div>
    </form>
  )
}

export default function TodayAddTileModal({ open, onClose, onCreated }) {
  const [typeId, setTypeId] = useState(null)

  function handleClose() {
    setTypeId(null)
    onClose()
  }

  const typeMeta = typeId ? TODAY_TILE_TYPES.find((t) => t.id === typeId) : null

  return (
    <TodayPanelModal
      open={open}
      onClose={handleClose}
      title="Add a box"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="today-add-tile-title"
        eyebrow={typeMeta ? typeMeta.eyebrow ?? 'Your board' : 'Your board'}
        title={typeMeta ? `New ${typeMeta.label.toLowerCase()} box` : 'Add a box'}
        lede={
          typeId
            ? 'Name your box and add a first entry — you can edit anytime.'
            : 'Pick a box type — drag tiles around your board anytime.'
        }
      >
        {typeId ? (
          <CreateForm
            typeId={typeId}
            onBack={() => setTypeId(null)}
            onCreated={onCreated}
            onClose={handleClose}
          />
        ) : (
          <TypePicker onPick={setTypeId} />
        )}
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
