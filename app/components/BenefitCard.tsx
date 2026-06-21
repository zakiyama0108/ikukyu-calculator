type Props = {
  badge: string
  badgeBgClass: string
  badgeTextClass: string
  name: string
  amount: number
  officialName: string
  source: '健康保険' | '雇用保険'
  period: string
  rateLabel: string
  dailyLimitReached: boolean
  bonusAmount?: number
}

export default function BenefitCard({
  badge,
  badgeBgClass,
  badgeTextClass,
  name,
  amount,
  officialName,
  source,
  period,
  rateLabel,
  dailyLimitReached,
  bonusAmount,
}: Props) {
  const sourceBgClass = source === '健康保険' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      {/* ヘッダー行 */}
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badgeBgClass} ${badgeTextClass}`}>
          {badge}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-800">{name}</span>
        <span className="text-base font-bold">
          {amount.toLocaleString()}円
        </span>
      </div>

      {/* お休み名・財源バッジ */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">お休み名：{officialName}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceBgClass}`}>
          {source}から支給
        </span>
      </div>

      <div className="h-px bg-gray-100" />

      {/* 詳細行 */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">対象期間</span>
          <span className="text-gray-700">{period}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">給付率</span>
          <span className="text-gray-700">{rateLabel}</span>
        </div>
        {bonusAmount !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-400">うち出生後休業支援給付金</span>
            <span className="text-gray-700">+{bonusAmount.toLocaleString()}円</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-400">日額上限</span>
          <span className={dailyLimitReached ? 'text-orange-500 font-medium' : 'text-gray-700'}>
            {dailyLimitReached ? '上限適用' : '未到達'}
          </span>
        </div>
      </div>
    </div>
  )
}
