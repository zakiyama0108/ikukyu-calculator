import type { CalculatorResult } from '../lib/types'

type Props = {
  result: CalculatorResult
}

export default function ResultSummary({ result }: Props) {
  const { totalAmount, summaryLabel, breakdownBar } = result
  // 各セグメントの日数合計を使ってバー幅の割合（%）を計算する
  const totalDays = breakdownBar.reduce((sum, s) => sum + s.days, 0)

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
        {breakdownBar.map((seg) => (
          <div
            key={seg.label}
            className={seg.colorClass}
            style={{ width: `${(seg.days / totalDays) * 100}%` }}
          />
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {breakdownBar.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${seg.colorClass}`} />
            <span className="text-xs text-gray-600">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
