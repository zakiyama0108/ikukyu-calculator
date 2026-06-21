// 給付金1件分の表示内容
type Props = {
  badge: string           // カード左上のバッジ文字（例: '産', '67%', '28日'）
  badgeBgClass: string    // バッジの背景色（Tailwindクラス）
  badgeTextClass: string  // バッジの文字色（Tailwindクラス）
  name: string            // 給付金の通称（例: '育児休業給付金'）
  amount: number          // 支給合計額（円）
  officialName: string    // 休業の正式名称（例: '産前産後休業（産休）'）
  source: '健康保険' | '雇用保険'
  period: string          // 対象期間の文字列（例: '2026/9/21〜2027/1/2（98日）'）
  rateLabel: string       // 給付率の説明（例: '休業前賃金の67%'）
  dailyLimitReached: boolean  // 日額上限に達している場合はtrue
  // 出生後休業支援給付金（+13%上乗せ）の金額
  // 配偶者が14日以上育休を取得した場合のみ発生するため省略可能
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
  // 健康保険=青、雇用保険=オレンジで財源を色分けする
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
          {/* 上限に達している場合はオレンジで強調して注意を促す */}
          <span className={dailyLimitReached ? 'text-orange-500 font-medium' : 'text-gray-700'}>
            {dailyLimitReached ? '上限適用' : '未到達'}
          </span>
        </div>
      </div>
    </div>
  )
}
