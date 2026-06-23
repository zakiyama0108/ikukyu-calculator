import type { BenefitItem } from './types'

type MaternityInput = {
  monthlySalary: number
  dueDate: string
}

type MamaLeaveInput = {
  monthlySalary: number
  dueDate: string
  leaveEndDate: string
}

// 出産手当金を計算して返す（ママ専用・健康保険）
// 対象期間: 産前42日 + 産後56日 = 98日
// 日額 = 標準報酬月額 ÷ 30 × 2/3（上限: 30,887円/日）
export function calcMaternityBenefit(_input: MaternityInput): BenefitItem {
  return {} as BenefitItem
}

// 育児休業給付金（育休前期・67%）を計算して返す（ママ専用・雇用保険）
// 対象期間: 育休1日目〜180日目
// bonusAmount: 育休1〜28日目の +13% 上乗せ額（出生後休業支援給付金）
// 日額上限: 賃金日額 16,110円（67%適用後: 10,793円/日）
export function calcMamaChildcare67(_input: MamaLeaveInput): BenefitItem {
  return {} as BenefitItem
}

// 育児休業給付金（育休後期・50%）を計算して返す（ママ専用・雇用保険）
// 対象期間: 育休181日目〜育休終了日
// 育休が180日以内の場合は null を返す
export function calcMamaChildcare50(_input: MamaLeaveInput): BenefitItem | null {
  return null
}
