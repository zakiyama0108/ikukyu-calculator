import type { BenefitItem, BreakdownBarSegment, PaymentSchedule, Mode, CalculatorInput, CalculatorResult } from './types'
import { getMaternityStartDate, getPostnatalEndDate, getMamaLeaveStartDate, getPapaLeaveStartDate, parseDate, formatDate, addDays, addMonths, splitIntoTwoMonthBlocks } from './dateUtils'

// 上限値（2025年8月1日〜2026年7月31日適用）
// 雇用保険の賃金日額上限。超過時は本値にキャップして給付を計算する
const DAILY_WAGE_LIMIT = 16110
// 健康保険の出産手当金日額上限（標準報酬月額 139万円 ÷ 30 × 2/3 の定数値）
const DAILY_HEALTH_LIMIT = 30887

type MaternityInput = {
  monthlySalary: number
  dueDate: string
}

type MamaLeaveInput = {
  monthlySalary: number
  dueDate: string
  leaveEndDate: string
}

type PaternityInput = {
  monthlySalary: number
  dueDate: string
  paternityDays?: number  // 実際に取得する産後パパ育休の日数（最大28日）。省略時は28日
}

type PapaLeaveInput = {
  monthlySalary: number
  dueDate: string
  leaveEndDate: string
}

// 対象期間の日数を返す（startDate・endDate の両端を含む）
function countDays(startDate: string, endDate: string): number {
  const diff = parseDate(endDate).getTime() - parseDate(startDate).getTime()
  return Math.round(diff / (86400 * 1000)) + 1
}

// 賃金日額（雇用保険）を計算して上限チェック結果とともに返す
// effectiveWageDaily: 上限キャップ後の日額（計算に使用する値）
// dailyLimitReached: 賃金日額が上限を超えているか
function calcEmploymentWageDaily(monthlySalary: number): { effectiveWageDaily: number; dailyLimitReached: boolean } {
  const wageDaily = Math.floor(monthlySalary / 30)
  return {
    effectiveWageDaily: Math.min(wageDaily, DAILY_WAGE_LIMIT),
    dailyLimitReached: wageDaily > DAILY_WAGE_LIMIT,
  }
}

// 出産手当金を計算して返す（ママ専用・健康保険）
// 日額 = floor(標準報酬月額 / 30 × 2/3)、上限 30,887円/日
export function calcMaternityBenefit(input: MaternityInput): BenefitItem {
  const { monthlySalary, dueDate } = input
  const startDate = getMaternityStartDate(dueDate)
  const endDate = getPostnatalEndDate(dueDate)
  // 産前42日 + 産後56日 = 98日（産前・産後を通じて常に固定）
  const days = 98

  const computedDaily = Math.floor(monthlySalary / 30 * 2 / 3)
  const dailyLimitReached = computedDaily > DAILY_HEALTH_LIMIT
  const daily = Math.min(computedDaily, DAILY_HEALTH_LIMIT)

  return {
    type: 'maternity',
    officialName: '産前産後休業（産休）',
    source: '健康保険',
    startDate,
    endDate,
    days,
    rateLabel: '標準報酬日額の2/3',
    amount: daily * days,
    dailyLimitReached,
  }
}

// 育児休業給付金（育休前期・67%）を計算して返す（ママ専用・雇用保険）
// 対象期間: 育休1日目〜180日目（leaveEndDate が180日未満なら leaveEndDate まで）
// bonusAmount: 育休1〜28日目の +13% 上乗せ額（出生後休業支援給付金）
export function calcMamaChildcare67(input: MamaLeaveInput): BenefitItem {
  const { monthlySalary, dueDate, leaveEndDate } = input
  const leaveStartDate = getMamaLeaveStartDate(dueDate)

  // 育休180日目 = leaveStart + 179日（1日目を起算日とするため -1）
  const day180 = formatDate(addDays(parseDate(leaveStartDate), 179))
  const endDate = day180 < leaveEndDate ? day180 : leaveEndDate
  const days = countDays(leaveStartDate, endDate)

  const { effectiveWageDaily, dailyLimitReached } = calcEmploymentWageDaily(monthlySalary)
  const daily67 = Math.floor(effectiveWageDaily * 67 / 100)
  const daily13 = Math.floor(effectiveWageDaily * 13 / 100)
  // bonusAmount は最大28日分。育休期間が28日未満の場合はその日数分のみ
  const bonusDays = Math.min(28, days)

  return {
    type: 'childcare67',
    officialName: '育児休業（育休）最初の180日',
    source: '雇用保険',
    startDate: leaveStartDate,
    endDate,
    days,
    rateLabel: '休業前賃金の67%',
    amount: daily67 * days,
    bonusAmount: daily13 * bonusDays,
    dailyLimitReached,
  }
}

// ── パパ専用 ─────────────────────────────────────────────────────────────────

// 出生時育児休業給付金を計算して返す（パパ専用・雇用保険）
// dueDate = 育休開始日（産後パパ育休の初日）
// 対象期間: dueDate 〜 dueDate + (paternityDays - 1)（最大28日）
// bonusAmount に +13% の出生後休業支援給付金を含む
export function calcPaternityBenefit(input: PaternityInput): BenefitItem {
  const { monthlySalary, dueDate, paternityDays = 28 } = input
  const startDate = dueDate
  const endDate = formatDate(addDays(parseDate(dueDate), paternityDays - 1))

  const { effectiveWageDaily, dailyLimitReached } = calcEmploymentWageDaily(monthlySalary)
  const daily67 = Math.floor(effectiveWageDaily * 67 / 100)
  const daily13 = Math.floor(effectiveWageDaily * 13 / 100)

  return {
    type: 'paternity',
    officialName: '出生時育休（産後パパ育休）',
    source: '雇用保険',
    startDate,
    endDate,
    days: paternityDays,
    rateLabel: '休業前賃金の67%',
    amount: daily67 * paternityDays,
    bonusAmount: daily13 * paternityDays,
    dailyLimitReached,
  }
}

// 育児休業給付金（育休前期・67%）を計算して返す（パパ専用・雇用保険）
// dueDate = 育休開始日（産後パパ育休の初日）
// 対象期間: 通常育休1日目（dueDate+28）〜 総育休180日目（dueDate+179）
// 産後パパ育休のみ取得（leaveEndDate ≤ dueDate+27）の場合は null を返す
export function calcPapaChildcare67(input: PapaLeaveInput): BenefitItem | null {
  const { monthlySalary, dueDate, leaveEndDate } = input
  const startDate = getPapaLeaveStartDate(dueDate)

  // 総育休180日目 = dueDate + 179日（産後パパ育休28日を通算した境界）
  const day180 = formatDate(addDays(parseDate(dueDate), 179))
  const endDate = day180 < leaveEndDate ? day180 : leaveEndDate
  const days = countDays(startDate, endDate)

  // leaveEndDate が産後パパ育休期間内（dueDate+27以前）の場合は通常育休なし
  if (days <= 0) return null

  const { effectiveWageDaily, dailyLimitReached } = calcEmploymentWageDaily(monthlySalary)
  const daily67 = Math.floor(effectiveWageDaily * 67 / 100)

  return {
    type: 'childcare67',
    officialName: '育児休業（育休）180日以内',
    source: '雇用保険',
    startDate,
    endDate,
    days,
    rateLabel: '休業前賃金の67%',
    amount: daily67 * days,
    dailyLimitReached,
  }
}

// 育休後期50%の共通計算ロジック。day181（181日目の日付）を呼び出し元が算出して渡す
function calcChildcare50Core(monthlySalary: number, day181: string, leaveEndDate: string): BenefitItem | null {
  if (day181 > leaveEndDate) return null

  const days = countDays(day181, leaveEndDate)
  const { effectiveWageDaily, dailyLimitReached } = calcEmploymentWageDaily(monthlySalary)
  const daily50 = Math.floor(effectiveWageDaily * 50 / 100)

  return {
    type: 'childcare50',
    officialName: '育児休業（育休）181日以降',
    source: '雇用保険',
    startDate: day181,
    endDate: leaveEndDate,
    days,
    rateLabel: '休業前賃金の50%',
    amount: daily50 * days,
    dailyLimitReached,
  }
}

// 育児休業給付金（育休後期・50%）を計算して返す（パパ専用・雇用保険）
// dueDate = 育休開始日（産後パパ育休の初日）
// 総育休181日目（dueDate+180）から leaveEndDate まで。180日以内なら null
export function calcPapaChildcare50(input: PapaLeaveInput): BenefitItem | null {
  // 総育休181日目 = dueDate + 180日（産後パパ育休28日を通算した境界）
  const day181 = formatDate(addDays(parseDate(input.dueDate), 180))
  return calcChildcare50Core(input.monthlySalary, day181, input.leaveEndDate)
}

// ── ママ専用（後期）────────────────────────────────────────────────────────────

// 育児休業給付金（育休後期・50%）を計算して返す（ママ専用・雇用保険）
// 育休181日目（leaveStart+180日）から leaveEndDate まで。180日以内なら null
export function calcMamaChildcare50(input: MamaLeaveInput): BenefitItem | null {
  const leaveStartDate = getMamaLeaveStartDate(input.dueDate)
  // 育休181日目 = leaveStart + 180日
  const day181 = formatDate(addDays(parseDate(leaveStartDate), 180))
  return calcChildcare50Core(input.monthlySalary, day181, input.leaveEndDate)
}

// ── 共通出力データ生成 ──────────────────────────────────────────────────────────

// 合計金額のラベルを返す（モードによって異なる）
export function calcSummaryLabel(mode: Mode): string {
  return mode === 'mama'
    ? '出産手当金 + 育児休業給付金の合計'
    : '出生時育児休業給付金 + 育児休業給付金の合計'
}

// 期間内訳バーのセグメント配列を返す（モード・dueDate・leaveEndDate から生成）
export function calcBreakdownBar(input: { mode: Mode; dueDate: string; leaveEndDate: string }): BreakdownBarSegment[] {
  const { mode, dueDate, leaveEndDate } = input

  if (mode === 'mama') {
    const leaveStartDate = getMamaLeaveStartDate(dueDate)
    // 育休180日目
    const day180 = formatDate(addDays(parseDate(leaveStartDate), 179))
    const childcare67EndDate = day180 < leaveEndDate ? day180 : leaveEndDate
    const childcare67Days = countDays(leaveStartDate, childcare67EndDate)

    const segments: BreakdownBarSegment[] = [
      { label: '産休', days: 98, colorClass: 'bg-rose-400' },
      { label: '育休（前期）', days: childcare67Days, colorClass: 'bg-teal-400' },
    ]

    // 育休181日目
    const day181 = formatDate(addDays(parseDate(leaveStartDate), 180))
    if (day181 <= leaveEndDate) {
      segments.push({ label: '育休（後期）', days: countDays(day181, leaveEndDate), colorClass: 'bg-sky-400' })
    }

    return segments
  } else {
    // パパ: 産後パパ育休（28日）+ 通常育休67% + 通常育休50%
    const paternityDays = 28
    // 総育休180日目 = dueDate + 179日
    const day180 = formatDate(addDays(parseDate(dueDate), 179))
    const childcare67EndDate = day180 < leaveEndDate ? day180 : leaveEndDate
    const leaveStartDate = getPapaLeaveStartDate(dueDate)
    const childcare67Days = countDays(leaveStartDate, childcare67EndDate)

    const segments: BreakdownBarSegment[] = [
      { label: '産後パパ育休', days: paternityDays, colorClass: 'bg-orange-400' },
      { label: '育休（前期）', days: childcare67Days, colorClass: 'bg-teal-400' },
    ]

    // 総育休181日目 = dueDate + 180日
    const day181 = formatDate(addDays(parseDate(dueDate), 180))
    if (day181 <= leaveEndDate) {
      segments.push({ label: '育休（後期）', days: countDays(day181, leaveEndDate), colorClass: 'bg-sky-400' })
    }

    return segments
  }
}

// 振込スケジュール一覧を返す（BenefitItem[] を2ヶ月ブロックに分割して生成）
// 最後のブロックには isFinal: true を付与する
// 振込予定月 = 対象期間の終了月 + 2ヶ月（雇用保険・健保ともに統一）
export function calcPaymentSchedules(benefits: BenefitItem[]): PaymentSchedule[] {
  const schedules: PaymentSchedule[] = []

  for (const benefit of benefits) {
    const blocks = splitIntoTwoMonthBlocks(benefit.startDate, benefit.endDate)
    const dailyRate = Math.floor(benefit.amount / benefit.days)

    for (const block of blocks) {
      const blockDays = countDays(block.startDate, block.endDate)
      // 振込予定月 = 終了月 + 2ヶ月
      const paymentDate = addMonths(parseDate(block.endDate), 2)
      const estimatedPaymentMonth = `${paymentDate.getUTCFullYear()}年${paymentDate.getUTCMonth() + 1}月中旬ごろ`

      schedules.push({
        startDate: block.startDate,
        endDate: block.endDate,
        days: blockDays,
        amount: dailyRate * blockDays,
        estimatedPaymentMonth,
        benefitType: benefit.type,
      })
    }
  }

  if (schedules.length > 0) {
    schedules[schedules.length - 1].isFinal = true
  }

  return schedules
}

// 全給付金の計算結果をまとめて返す（CalculatorInput → CalculatorResult）
export function calcResult(input: CalculatorInput): CalculatorResult {
  const { mode, monthlySalary, dueDate, leaveEndDate } = input

  let benefits: BenefitItem[]

  if (mode === 'mama') {
    const maternity = calcMaternityBenefit({ monthlySalary, dueDate })
    const childcare67 = calcMamaChildcare67({ monthlySalary, dueDate, leaveEndDate })
    const childcare50 = calcMamaChildcare50({ monthlySalary, dueDate, leaveEndDate })
    benefits = [maternity, childcare67, ...(childcare50 ? [childcare50] : [])]
  } else {
    const paternity = calcPaternityBenefit({ monthlySalary, dueDate })
    const childcare67 = calcPapaChildcare67({ monthlySalary, dueDate, leaveEndDate })
    const childcare50 = calcPapaChildcare50({ monthlySalary, dueDate, leaveEndDate })
    benefits = [paternity, ...(childcare67 ? [childcare67] : []), ...(childcare50 ? [childcare50] : [])]
  }

  // 給付金合計 = 基本額 + 出生後休業支援給付金（+13%）の合算
  const totalAmount = benefits.reduce((sum, b) => sum + b.amount + (b.bonusAmount ?? 0), 0)

  return {
    totalAmount,
    summaryLabel: calcSummaryLabel(mode),
    breakdownBar: calcBreakdownBar({ mode, dueDate, leaveEndDate }),
    benefits,
    paymentSchedules: calcPaymentSchedules(benefits),
  }
}
