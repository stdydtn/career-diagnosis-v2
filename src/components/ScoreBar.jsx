/**
 * @param {{ label?: string, value?: number, description?: string, valueScale?: 'five' | 'hundred' }} props
 */
export function ScoreBar({
  label = '점수',
  value = 0,
  description = '',
  valueScale = 'five',
}) {
  const raw = Number.isFinite(value) ? value : 0
  const safeValue =
    valueScale === 'hundred'
      ? Math.max(0, Math.min(100, raw))
      : Math.max(0, Math.min(5, raw))
  const percent =
    valueScale === 'hundred'
      ? Math.round(safeValue)
      : Math.round((safeValue / 5) * 100)
  const displayValue =
    valueScale === 'hundred' ? Math.round(safeValue) : safeValue.toFixed(2)
  const suffix = valueScale === 'hundred' ? '100' : '5'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-600">
          {displayValue} / {suffix}
        </span>
      </div>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      <div className="h-3 w-full rounded-full bg-slate-100 ring-1 ring-slate-200">
        <div
          className="h-3 rounded-full bg-slate-900"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

