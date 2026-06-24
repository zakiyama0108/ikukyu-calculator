import type { BenefitItem } from './types'
import { getMaternityStartDate, getPostnatalEndDate, getMamaLeaveStartDate } from './dateUtils'

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

// タイムゾーンの影響を排除するため UTC で日付演算を行う
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400 * 1000)
}

// 対象期間の日数を返す（startDate・endDate の両端を含む）
function countDays(startDate: string, endDate: string): number {
  const diff = parseDate(endDate).getTime() - parseDate(startDate).getTime()
  return Math.round(diff / (86400 * 1000)) + 1
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

  const wageDaily = Math.floor(monthlySalary / 30)
  const dailyLimitReached = wageDaily > DAILY_WAGE_LIMIT
  const effectiveWageDaily = Math.min(wageDaily, DAILY_WAGE_LIMIT)

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

// 育児休業給付金（育休後期・50%）を計算して返す（ママ専用・雇用保険）
// 対象期間: 育休181日目〜leaveEndDate。育休が180日以内の場合は null を返す
export function calcMamaChildcare50(input: MamaLeaveInput): BenefitItem | null {
  const { monthlySalary, dueDate, leaveEndDate } = input
  const leaveStartDate = getMamaLeaveStartDate(dueDate)

  // 育休181日目 = leaveStart + 180日
  const day181 = formatDate(addDays(parseDate(leaveStartDate), 180))
  if (day181 > leaveEndDate) return null

  const days = countDays(day181, leaveEndDate)
  const wageDaily = Math.floor(monthlySalary / 30)
  const dailyLimitReached = wageDaily > DAILY_WAGE_LIMIT
  const effectiveWageDaily = Math.min(wageDaily, DAILY_WAGE_LIMIT)
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
