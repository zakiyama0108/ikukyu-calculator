export type Mode = 'mama' | 'papa'

export type CalculatorInput = {
  mode: Mode
  monthlySalary: number    // 月給・円（手取り前の総支給額）
  dueDate: string          // ママ: 出産予定日 / パパ: 育休開始日（産後パパ育休の初日）（YYYY-MM-DD）
  leaveEndDate: string     // 育休終了予定日（YYYY-MM-DD）
}

export type BenefitType =
  | 'maternity'            // 出産手当金（ママのみ・健康保険）
  | 'childcare67'          // 育児休業給付金 最初の180日（67%）
  | 'childcare50'          // 育児休業給付金 181日以降（50%、ママのみ）
  | 'paternity'            // 出生時育児休業給付金（パパのみ・産後パパ育休）

export type BenefitItem = {
  type: BenefitType
  officialName: string     // 制度正式名（例：育児休業（育休）最初の180日）
  source: '健康保険' | '雇用保険'
  startDate: string        // YYYY-MM-DD
  endDate: string          // YYYY-MM-DD
  days: number
  rateLabel: string        // 表示用（例：「休業前賃金の67%」）
  amount: number           // 給付総額（円）
  bonusAmount?: number     // 出生後休業支援給付金の上乗せ額（+13%）
  dailyLimitReached: boolean
}

export type PaymentSchedule = {
  startDate: string
  endDate: string
  days: number
  amount: number
  estimatedPaymentMonth: string  // 例：「2027年4月中旬ごろ」
  benefitType: BenefitType
  isFinal?: boolean        // 「最終振込」バッジ用
}

export type BreakdownBarSegment = {
  label: string            // 例：「産休・98日」
  days: number
  colorClass: string       // Tailwindクラス（例：「bg-pink-400」）
}

export type CalculatorResult = {
  totalAmount: number
  summaryLabel: string     // 例：「出産手当金 + 育児休業給付金の合計」
  breakdownBar: BreakdownBarSegment[]
  benefits: BenefitItem[]
  paymentSchedules: PaymentSchedule[]
}
