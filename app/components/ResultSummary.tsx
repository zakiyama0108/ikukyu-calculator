type BreakdownSegment = {
  label: string
  days: number
  colorClass: string
}

type Props = {
  totalAmount: number
  summaryLabel: string
  segments: BreakdownSegment[]
}

export default function ResultSummary({ totalAmount, summaryLabel, segments }: Props) {
  const totalDays = segments.reduce((sum, s) => sum + s.days, 0)

  return (
    <div>
      <p className="text-sm text-gray-500">受け取れる給付金の合計（非課税）</p>
      <p className="mt-1 text-4xl font-bold tracking-tight">
        {totalAmount.toLocaleString()}
        <span className="text-xl font-medium">円</span>
      </p>
      <p className="mt-0.5 text-sm text-gray-500">{summaryLabel}</p>

      {/* 内訳バー */}
      <div className="mt-3 flex h-3 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={seg.colorClass}
            style={{ width: `${(seg.days / totalDays) * 100}%` }}
          />
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${seg.colorClass}`} />
            <span className="text-xs text-gray-600">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
