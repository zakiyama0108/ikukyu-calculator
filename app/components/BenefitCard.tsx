import type { BenefitItem } from '../lib/types'

type Props = {
  benefit: BenefitItem
  isNotApplicable?: boolean  // パパモードの出産手当金など「対象外」を示す場合 true
}

// 給付種別ごとのバッジスタイルを返す
function getBadgeStyle(type: BenefitItem['type']): { text: string; bgClass: string; textClass: string } {
  switch (type) {
    case 'maternity':   return { text: '産',    bgClass: 'bg-rose-100',   textClass: 'text-rose-600' }
    case 'childcare67': return { text: '67%',   bgClass: 'bg-teal-100',   textClass: 'text-teal-600' }
    case 'childcare50': return { text: '50%',   bgClass: 'bg-sky-100',    textClass: 'text-sky-600' }
    case 'paternity':   return { text: '出生時', bgClass: 'bg-orange-100', textClass: 'text-orange-600' }
  }
}

export default function BenefitCard({ benefit, isNotApplicable = false }: Props) {
  const { officialName, source, startDate, endDate, days, rateLabel, amount, bonusAmount, dailyLimitReached } = benefit
  const { text: badge, bgClass: badgeBgClass, textClass: badgeTextClass } = getBadgeStyle(benefit.type)
  // 健康保険=青、雇用保険=オレンジで財源を色分けする
  const sourceBgClass = source === '健康保険' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      {/* 対象外バナー（パパモードの出産手当金など） */}
      {isNotApplicable && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 z-10">
          <span className="rounded-full bg-gray-200 px-4 py-1 text-sm font-medium text-gray-500">対象外</span>
        </div>
      )}

      {/* ヘッダー行 */}
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badgeBgClass} ${badgeTextClass}`}>
          {badge}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-800">{officialName}</span>
        <span className="text-base font-bold">{amount.toLocaleString()}円</span>
      </div>

      {/* 財源バッジ */}
      <div className="flex items-center justify-end">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceBgClass}`}>
          {source}から支給
        </span>
      </div>

      <div className="h-px bg-gray-100" />

      {/* 詳細行 */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">対象期間</span>
          <span className="text-gray-700">{startDate}〜{endDate}（{days}日）</span>
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
          {/* 上限に達している場合はオレンジで強調して注意を促す */}
          <span className={dailyLimitReached ? 'text-orange-500 font-medium' : 'text-gray-700'}>
            {dailyLimitReached ? '上限適用' : '未到達'}
          </span>
        </div>
      </div>
    </div>
  )
}
