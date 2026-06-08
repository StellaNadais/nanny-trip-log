import { useMemo } from 'react'
import { buildHubShiftYearChart } from '../utils/hubShiftYearChart'

/** Full-width chart on Nanny hub page (larger than former hub tile). */
const W = 288
const H = 82
const BASE_Y = 62
const MAX_BAR = 46
const COL_W = 24
const BAR_W = 11

/**
 * Bars = shift days logged per month; accent = days with in & out;
 * line = average slot punctuality score (see hubShiftYearChart).
 */
export default function NotesYearChart({ entries }) {
  const model = useMemo(() => buildHubShiftYearChart(entries), [entries])
  const { year, months, yearTotal, maxLogged } = model

  const linePts = months
    .map((m, i) => {
      if (m.punctualityAvg == null) return null
      return {
        x: i * COL_W + COL_W / 2,
        y: 17 - (m.punctualityAvg / 100) * 13,
      }
    })
    .filter(Boolean)

  let linePath = ''
  if (linePts.length >= 2) {
    linePath = `M ${linePts.map((p) => `${p.x},${p.y}`).join(' L ')}`
  }

  const title =
    yearTotal === 0
      ? `${year}: no shifts logged yet — bars will grow when you use Shift.`
      : `${year}: up to ${maxLogged} shift days in one month. Accent stack = days with in and out. Line = average punctuality from arrival and end time choices.`

  return (
    <div className="notes-year-chart-wrap">
      <svg
        className="notes-year-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <line className="notes-year-chart__axis" x1="0" y1={BASE_Y} x2={W} y2={BASE_Y} />
        {months.map((m, i) => {
          const x = i * COL_W + (COL_W - BAR_W) / 2
          const hLog = m.logged > 0 ? Math.max(4, m.barHLogged * MAX_BAR) : yearTotal === 0 ? 3 : 0
          const hFull = m.full > 0 ? Math.max(3, m.barHFull * MAX_BAR) : 0
          return (
            <g key={m.index}>
              {hLog > 0 ? (
                <rect
                  className="notes-year-chart__bar notes-year-chart__bar--logged"
                  x={x}
                  y={BASE_Y - hLog}
                  width={BAR_W}
                  height={hLog}
                  rx={1.5}
                />
              ) : null}
              {hFull > 0 ? (
                <rect
                  className="notes-year-chart__bar notes-year-chart__bar--full"
                  x={x}
                  y={BASE_Y - hFull}
                  width={BAR_W}
                  height={hFull}
                  rx={1.5}
                />
              ) : null}
              <text
                className="notes-year-chart__mo"
                x={x + BAR_W / 2}
                y={H - 4}
                textAnchor="middle"
              >
                {m.letter}
              </text>
            </g>
          )
        })}
        {linePath ? (
          <path
            className="notes-year-chart__line"
            d={linePath}
            fill="none"
            strokeWidth={1.6}
            vectorEffect="non-scaling-stroke"
          />
        ) : linePts.length === 1 ? (
          <circle
            className="notes-year-chart__dot"
            cx={linePts[0].x}
            cy={linePts[0].y}
            r={2.25}
          />
        ) : null}
      </svg>
      <p className="notes-year-chart__caption">
        <span className="notes-year-chart__cap-year">{year}</span>
        <span aria-hidden> · </span>
        bar height = days logged that month
        <span aria-hidden> · </span>
        line = earlier arrival/end slots score higher
      </p>
    </div>
  )
}
