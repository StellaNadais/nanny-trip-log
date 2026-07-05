import { useEffect, useMemo, useState } from 'react'
import { SoftCard } from './SoftCardPanel'
import {
  contractProgress,
  countTimeOff,
  loadShiftContract,
  resourceStatus,
  saveShiftContract,
  timeOffForDate,
} from '../utils/shiftContractStorage'
import { ContractResourcePips, ContractStatMeter } from './ShiftContractGamify'

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

/**
 * Vacation, sick days, and contract length — soft-panel stats (matches Thank you / Overview).
 */
export default function ShiftContractSetup({
  selectedDateISO,
  titleId = 'shift-contract-title',
  embedded = false,
}) {
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

  const statsTeaserPlain = (
    <ul className="contract-stats-teaser__stats">
      <li className="contract-stats-teaser__stat">
        <span className="contract-stats-teaser__stat-label">Contract length</span>
        <strong className="contract-stats-teaser__stat-value">{season.daysLeft}</strong>
        <span className="contract-stats-teaser__stat-hint muted">days left</span>
      </li>
      <li className="contract-stats-teaser__stat">
        <span className="contract-stats-teaser__stat-label">Vacation</span>
        <strong className="contract-stats-teaser__stat-value">{vacation.left}</strong>
        <span className="contract-stats-teaser__stat-hint muted">
          {vacation.left} of {contract.vacationAllowance} left
        </span>
      </li>
      <li className="contract-stats-teaser__stat">
        <span className="contract-stats-teaser__stat-label">Sick days</span>
        <strong className="contract-stats-teaser__stat-value">{sick.left}</strong>
        <span className="contract-stats-teaser__stat-hint muted">
          {sick.left} of {contract.sickAllowance} left
        </span>
      </li>
    </ul>
  )

  const statsGridFull = (
    <ul className="soft-panel__grid soft-panel__grid--overview-stats soft-panel__grid--contract-stats">
      <SoftCard index={0} icon="◎" tone="peach" title="Contract length">
        <p className="soft-panel__card-meta schedule-overview-stat__value">{season.daysLeft}</p>
        <p className="soft-panel__card-body muted">days left · {season.percent}% through</p>
        <ContractStatMeter percent={season.percent} tone="contract" />
        <dl className="contract-stats__meta">
          <div className="contract-stats__meta-field">
            <dt>Start</dt>
            <dd>
              <input
                type="date"
                className="input input--line contract-stats__date-input"
                value={contract.contractStartISO}
                onChange={(e) => patch({ contractStartISO: e.target.value })}
                aria-label="Contract start date"
              />
            </dd>
          </div>
          <div className="contract-stats__meta-field">
            <dt>End</dt>
            <dd>
              <input
                type="date"
                className="input input--line contract-stats__date-input"
                value={contract.contractEndISO}
                onChange={(e) => patch({ contractEndISO: e.target.value })}
                aria-label="Contract end date"
              />
            </dd>
          </div>
        </dl>
      </SoftCard>

      <SoftCard index={1} icon="☀" tone="mint" title="Vacation">
        <p className="soft-panel__card-meta schedule-overview-stat__value">{vacation.left}</p>
        <p className="soft-panel__card-body muted">
          {vacation.left} of {contract.vacationAllowance} left · {vacation.tag}
        </p>
        <dl className="contract-stats__meta contract-stats__meta--compact">
          <div className="contract-stats__meta-field">
            <dt>Allowance</dt>
            <dd>
              <input
                type="number"
                min={0}
                className="input input--line contract-stats__num-input"
                value={contract.vacationAllowance}
                onChange={(e) => patchAllowance('vacationAllowance', e.target.value)}
                aria-label="Vacation day allowance"
              />
            </dd>
          </div>
          <div className="contract-stats__meta-field">
            <dt>Used</dt>
            <dd>{vacationUsed}</dd>
          </div>
        </dl>
        <ContractResourcePips used={vacationUsed} total={contract.vacationAllowance} tone="vacation" />
        <ContractStatMeter percent={vacationPct} tone="vacation" />
      </SoftCard>

      <SoftCard index={2} icon="✚" tone="lavender" title="Sick days">
        <p className="soft-panel__card-meta schedule-overview-stat__value">{sick.left}</p>
        <p className="soft-panel__card-body muted">
          {sick.left} of {contract.sickAllowance} left · {sick.tag}
        </p>
        <dl className="contract-stats__meta contract-stats__meta--compact">
          <div className="contract-stats__meta-field">
            <dt>Allowance</dt>
            <dd>
              <input
                type="number"
                min={0}
                className="input input--line contract-stats__num-input"
                value={contract.sickAllowance}
                onChange={(e) => patchAllowance('sickAllowance', e.target.value)}
                aria-label="Sick day allowance"
              />
            </dd>
          </div>
          <div className="contract-stats__meta-field">
            <dt>Used</dt>
            <dd>{sickUsed}</dd>
          </div>
        </dl>
        <ContractResourcePips used={sickUsed} total={contract.sickAllowance} tone="sick" />
        <ContractStatMeter percent={sickPct} tone="sick" />
      </SoftCard>
    </ul>
  )

  const stampSection = (
    <section className="contract-stats__stamp" aria-label="Mark selected day">
      <div className="contract-stats__stamp-head">
        <span className="contract-stats__stamp-title">Daily stamp</span>
        <span className="contract-stats__stamp-date muted">{formatStampDate(selectedDateISO)}</span>
      </div>
      {selectedStamp ? (
        <p className="contract-stats__stamp-current">
          Marked as <strong>{selectedStamp.kind === 'sick' ? 'sick day' : 'vacation'}</strong>
        </p>
      ) : (
        <p className="contract-stats__stamp-hint muted">Pick a stamp for this shift day</p>
      )}
      <div className="contract-stats__stamp-row" role="group" aria-label="Mark selected day">
        <button
          type="button"
          className={`contract-stats__stamp-btn contract-stats__stamp-btn--vacation${selectedStamp?.kind === 'vacation' ? ' contract-stats__stamp-btn--on' : ''}`}
          onClick={() => toggleStamp('vacation')}
          aria-pressed={selectedStamp?.kind === 'vacation'}
        >
          ☀ Vacation
        </button>
        <button
          type="button"
          className={`contract-stats__stamp-btn contract-stats__stamp-btn--sick${selectedStamp?.kind === 'sick' ? ' contract-stats__stamp-btn--on' : ''}`}
          onClick={() => toggleStamp('sick')}
          aria-pressed={selectedStamp?.kind === 'sick'}
        >
          ✚ Sick day
        </button>
      </div>
    </section>
  )

  if (embedded) {
    return (
      <section className="contract-stats-teaser" aria-labelledby={titleId}>
        <header className="contract-stats-teaser__head">
          <span className="contract-stats-teaser__eyebrow">Contract</span>
          <h2 id={titleId} className="contract-stats-teaser__title">
            Contract stats
          </h2>
          <p className="contract-stats-teaser__meta muted">{season.label}</p>
        </header>
        {statsTeaserPlain}
      </section>
    )
  }

  return (
    <section className="soft-panel soft-panel--contract-stats soft-panel--book-popup" aria-labelledby={titleId}>
      <div className="soft-panel__hero">
        <p className="soft-panel__eyebrow">Contract</p>
        <h2 id={titleId} className="soft-panel__title">
          Contract stats
        </h2>
        <p className="soft-panel__meta muted">{season.label}</p>
        <p className="soft-panel__lede">Track season progress, vacation, sick days, and daily stamps.</p>
      </div>

      <div className="soft-panel__body soft-panel__body--contract-stats">
        {statsGridFull}
        {stampSection}
      </div>
    </section>
  )
}
