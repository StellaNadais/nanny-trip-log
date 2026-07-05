import { useEffect, useMemo, useState } from 'react'
import {
  contractProgress,
  countTimeOff,
  loadShiftContract,
  resourceStatus,
  saveShiftContract,
  timeOffForDate,
} from '../utils/shiftContractStorage'

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatStampDate(iso) {
  if (!iso) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function StatMeter({ percent, tone }) {
  return (
    <div className="shift-setup__meter" aria-hidden>
      <div
        className={`shift-setup__meter-fill shift-setup__meter-fill--${tone}`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

/**
 * Vacation, sick days, and contract length — one “game loadout” stats panel.
 */
export default function ShiftContractSetup({ selectedDateISO, titleId = 'shift-contract-title' }) {
  const [contract, setContract] = useState(() => loadShiftContract())

  useEffect(() => {
    saveShiftContract(contract)
  }, [contract])

  const vacationUsed = useMemo(
    () => countTimeOff(contract.timeOff, 'vacation'),
    [contract.timeOff]
  )
  const sickUsed = useMemo(() => countTimeOff(contract.timeOff, 'sick'), [contract.timeOff])
  const season = useMemo(
    () => contractProgress(contract.contractStartISO, contract.contractEndISO),
    [contract.contractStartISO, contract.contractEndISO]
  )
  const vacation = useMemo(
    () => resourceStatus(vacationUsed, contract.vacationAllowance),
    [vacationUsed, contract.vacationAllowance]
  )
  const sick = useMemo(
    () => resourceStatus(sickUsed, contract.sickAllowance),
    [sickUsed, contract.sickAllowance]
  )
  const selectedStamp = useMemo(
    () => timeOffForDate(contract.timeOff, selectedDateISO),
    [contract.timeOff, selectedDateISO]
  )

  function patch(updates) {
    setContract((prev) => ({ ...prev, ...updates }))
  }

  function patchAllowance(field, raw) {
    const n = Math.max(0, Number.parseInt(String(raw), 10) || 0)
    patch({ [field]: n })
  }

  function toggleStamp(kind) {
    setContract((prev) => {
      const hit = prev.timeOff.find((e) => e.dateISO === selectedDateISO)
      if (hit?.kind === kind) {
        return { ...prev, timeOff: prev.timeOff.filter((e) => e.id !== hit.id) }
      }
      const withoutDay = prev.timeOff.filter((e) => e.dateISO !== selectedDateISO)
      return {
        ...prev,
        timeOff: [...withoutDay, { id: uid(), dateISO: selectedDateISO, kind }],
      }
    })
  }

  const vacationPct =
    contract.vacationAllowance > 0
      ? Math.round((vacationUsed / contract.vacationAllowance) * 100)
      : 0
  const sickPct =
    contract.sickAllowance > 0 ? Math.round((sickUsed / contract.sickAllowance) * 100) : 0

  return (
    <div className="shift-setup shift-setup--modal-panel">
      <div className="shift-setup__head">
        <div className="shift-setup__bar">
          <span className="shift-setup__bar-tag">Loadout</span>
          <span className="shift-setup__bar-status">{season.label}</span>
        </div>
        <h2 className="shift-setup__title" id={titleId}>
          contract stats
        </h2>
      </div>

      <ul className="shift-setup__stat-list">
        <li className="shift-setup__stat shift-setup__stat--contract">
          <div className="shift-setup__stat-head">
            <span className="shift-setup__stat-num" aria-hidden>
              01
            </span>
            <span className={`shift-setup__stat-badge shift-setup__stat-badge--ok`}>Season</span>
          </div>
          <h3 className="shift-setup__stat-title">Contract length</h3>
          <dl className="shift-setup__meta">
            <div className="shift-setup__meta-row">
              <dt>Start</dt>
              <dd>
                <input
                  type="date"
                  className="shift-setup__date-input"
                  value={contract.contractStartISO}
                  onChange={(e) => patch({ contractStartISO: e.target.value })}
                  aria-label="Contract start date"
                />
              </dd>
            </div>
            <div className="shift-setup__meta-row">
              <dt>End</dt>
              <dd>
                <input
                  type="date"
                  className="shift-setup__date-input"
                  value={contract.contractEndISO}
                  onChange={(e) => patch({ contractEndISO: e.target.value })}
                  aria-label="Contract end date"
                />
              </dd>
            </div>
            <div className="shift-setup__meta-row">
              <dt>Progress</dt>
              <dd>{season.percent}% · {season.daysLeft} days left</dd>
            </div>
          </dl>
          <StatMeter percent={season.percent} tone="contract" />
        </li>

        <li className="shift-setup__stat shift-setup__stat--vacation">
          <div className="shift-setup__stat-head">
            <span className="shift-setup__stat-num" aria-hidden>
              02
            </span>
            <span className={`shift-setup__stat-badge shift-setup__stat-badge--${vacation.tone}`}>
              {vacation.tag}
            </span>
          </div>
          <h3 className="shift-setup__stat-title">Vacation days</h3>
          <dl className="shift-setup__meta">
            <div className="shift-setup__meta-row">
              <dt>Allowance</dt>
              <dd>
                <input
                  type="number"
                  min={0}
                  className="shift-setup__num-input"
                  value={contract.vacationAllowance}
                  onChange={(e) => patchAllowance('vacationAllowance', e.target.value)}
                  aria-label="Vacation day allowance"
                />
              </dd>
            </div>
            <div className="shift-setup__meta-row">
              <dt>Used</dt>
              <dd>{vacationUsed}</dd>
            </div>
            <div className="shift-setup__meta-row">
              <dt>Left</dt>
              <dd>{vacation.left}</dd>
            </div>
          </dl>
          <StatMeter percent={vacationPct} tone="vacation" />
        </li>

        <li className="shift-setup__stat shift-setup__stat--sick">
          <div className="shift-setup__stat-head">
            <span className="shift-setup__stat-num" aria-hidden>
              03
            </span>
            <span className={`shift-setup__stat-badge shift-setup__stat-badge--${sick.tone}`}>
              {sick.tag}
            </span>
          </div>
          <h3 className="shift-setup__stat-title">Sick days</h3>
          <dl className="shift-setup__meta">
            <div className="shift-setup__meta-row">
              <dt>Allowance</dt>
              <dd>
                <input
                  type="number"
                  min={0}
                  className="shift-setup__num-input"
                  value={contract.sickAllowance}
                  onChange={(e) => patchAllowance('sickAllowance', e.target.value)}
                  aria-label="Sick day allowance"
                />
              </dd>
            </div>
            <div className="shift-setup__meta-row">
              <dt>Used</dt>
              <dd>{sickUsed}</dd>
            </div>
            <div className="shift-setup__meta-row">
              <dt>Left</dt>
              <dd>{sick.left}</dd>
            </div>
          </dl>
          <StatMeter percent={sickPct} tone="sick" />
        </li>
      </ul>

      <div className="shift-setup__stamp">
        <p className="shift-setup__stamp-label">
          Stamp <strong>{formatStampDate(selectedDateISO)}</strong>
          {selectedStamp ? (
            <span className="shift-setup__stamp-current">
              {' '}
              · marked {selectedStamp.kind === 'sick' ? 'sick' : 'vacation'}
            </span>
          ) : null}
        </p>
        <div className="shift-setup__stamp-row" role="group" aria-label="Mark selected day">
          <button
            type="button"
            className={`shift-setup__stamp-btn shift-setup__stamp-btn--vacation${selectedStamp?.kind === 'vacation' ? ' shift-setup__stamp-btn--on' : ''}`}
            onClick={() => toggleStamp('vacation')}
            aria-pressed={selectedStamp?.kind === 'vacation'}
          >
            Vacation
          </button>
          <button
            type="button"
            className={`shift-setup__stamp-btn shift-setup__stamp-btn--sick${selectedStamp?.kind === 'sick' ? ' shift-setup__stamp-btn--on' : ''}`}
            onClick={() => toggleStamp('sick')}
            aria-pressed={selectedStamp?.kind === 'sick'}
          >
            Sick day
          </button>
        </div>
      </div>
    </div>
  )
}
