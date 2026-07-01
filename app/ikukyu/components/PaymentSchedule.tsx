import type { BenefitType, PaymentSchedule } from '../lib/types'

type Props = {
  schedules: PaymentSchedule[]
}

const BENEFIT_LABEL: Record<BenefitType, string> = {
  maternity:   '出産手当金',
  paternity:   '出生時育児休業給付金',
  childcare67: '育休給付金（67%）',
  childcare50: '育休給付金（50%）',
}

// デフォルトエクスポートは PaymentScheduleList にして types.ts の PaymentSchedule 型と名前が衝突しないようにする
export default function PaymentScheduleList({ schedules }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">いつ・いくら振り込まれるか</h2>
        <span className="text-xs text-gray-400">振込時期は目安です</span>
      </div>

      <div className="space-y-3">
        {schedules.map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-xs text-gray-500">{s.startDate}〜{s.endDate}（{s.days}日）</span>
              <span className="text-base font-bold">{s.amount.toLocaleString()}円</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {BENEFIT_LABEL[s.benefitType]}
                </span>
                {s.isFinal && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 font-medium">
                    最終振込
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">振込予定 {s.estimatedPaymentMonth}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400 leading-relaxed">
        振込日安は、対象期間の終了後に申請し、ハローワークの審査を経て1〜2ヶ月ほどで振り込まれる一般的なケースを想定したものです。会社の手続きや状況により前後することがあります。
      </p>
    </div>
  )
}
