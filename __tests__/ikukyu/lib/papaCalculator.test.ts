import { describe, it, expect } from 'vitest'
import {
  calcPaternityBenefit,
  calcPapaChildcare67,
  calcPapaChildcare50,
} from '../../../app/ikukyu/lib/calculator'

// leaveStartDate='2026-11-01', paternityDays=28 の各基準日:
//   産後パパ育休終了日 = leaveStartDate + 27日 = '2026-11-28'
//   通常育休開始日     = leaveStartDate + 28日 = '2026-11-29'
//   総育休180日目      = leaveStartDate + 179日 = '2027-04-29'
//   総育休181日目      = leaveStartDate + 180日 = '2027-04-30'（50%期間の開始日）

// 出生時育休の日額 = floor(min(賃金日額, 16110) × 67/100)
// bonusAmount     = floor(min(賃金日額, 16110) × 13/100) × 取得日数
// 賃金日額        = floor(monthlySalary / 30)
describe('出生時育児休業給付金（産後パパ育休）', () => {
  it('28日取得: monthlySalary=380000 → 28日分（67% + bonusAmount 13%）が返る', () => {
    // 賃金日額 = floor(380000/30) = 12666円
    // 日額67% = floor(12666 × 67/100) = floor(8486.22) = 8486円
    // 日額13% = floor(12666 × 13/100) = floor(1646.58) = 1646円
    // amount     = 8486 × 28 = 237,608円
    // bonusAmount = 1646 × 28 = 46,088円
    const result = calcPaternityBenefit({ monthlySalary: 380000, dueDate: '2026-11-01' })
    expect(result.type).toBe('paternity')
    expect(result.source).toBe('雇用保険')
    expect(result.startDate).toBe('2026-11-01')
    expect(result.endDate).toBe('2026-11-28')
    expect(result.days).toBe(28)
    expect(result.amount).toBe(237608)
    expect(result.bonusAmount).toBe(46088)
    expect(result.dailyLimitReached).toBe(false)
  })

  it('14日取得: → 14日分の金額が返る', () => {
    // endDate = dueDate + (14 - 1) = '2026-11-14'
    // amount     = 8486 × 14 = 118,804円
    // bonusAmount = 1646 × 14 = 23,044円
    const result = calcPaternityBenefit({ monthlySalary: 380000, dueDate: '2026-11-01', paternityDays: 14 })
    expect(result.endDate).toBe('2026-11-14')
    expect(result.days).toBe(14)
    expect(result.amount).toBe(118804)
    expect(result.bonusAmount).toBe(23044)
  })

  it('上限ケース: monthlySalary=1000000 → 賃金日額上限16,110円が適用されること', () => {
    // 賃金日額 = floor(1000000/30) = 33333円 → 上限16,110円にキャップ
    // 日額67% = floor(16110 × 67/100) = floor(10793.7) = 10793円
    // amount = 10793 × 28 = 302,204円
    const result = calcPaternityBenefit({ monthlySalary: 1000000, dueDate: '2026-11-01' })
    expect(result.dailyLimitReached).toBe(true)
    expect(result.amount).toBe(302204)
  })
})

// 通常育休67%日額 = floor(min(賃金日額, 16110) × 67/100)
// 対象期間: leaveStartDate+paternityDays〜総育休180日目（leaveStartDate+179）
// 総育休180日目を超える場合は leaveStartDate+179 で打ち切る
describe('育児休業給付金（パパ・前期67%）', () => {
  it('leaveEndDate="2027-04-29"（総育休180日目）→ 通常育休全期間が67%で返る', () => {
    // 通常育休開始: leaveStartDate+28 = '2026-11-29'
    // day180:       leaveStartDate+179 = '2027-04-29'
    // endDate = min(day180, leaveEndDate) = '2027-04-29'
    // 日数: '2026-11-29' 〜 '2027-04-29' = 152日
    // 日額67% = 8486円
    // amount = 8486 × 152 = 1,289,872円
    const result = calcPapaChildcare67({
      monthlySalary: 380000,
      leaveStartDate: '2026-11-01',
      paternityDays: 28,
      leaveEndDate: '2027-04-29',
    })
    expect(result).not.toBeNull()
    expect(result!.type).toBe('childcare67')
    expect(result!.source).toBe('雇用保険')
    expect(result!.startDate).toBe('2026-11-29')
    expect(result!.endDate).toBe('2027-04-29')
    expect(result!.days).toBe(152)
    expect(result!.amount).toBe(1289872)
    expect(result!.dailyLimitReached).toBe(false)
  })

  it('leaveEndDate="2027-08-31"（総育休180日超）→ 67%は総育休180日目（2027-04-29）で終わる', () => {
    // 67%はleaveStartDate+179=2027-04-29 で打ち切り（翌日から50%）
    // 152日・amount = 8486 × 152 = 1,289,872円
    const result = calcPapaChildcare67({
      monthlySalary: 380000,
      leaveStartDate: '2026-11-01',
      paternityDays: 28,
      leaveEndDate: '2027-08-31',
    })
    expect(result!.endDate).toBe('2027-04-29')
    expect(result!.days).toBe(152)
    expect(result!.amount).toBe(1289872)
  })

  it('paternityDays=0（産後パパ育休なし）→ 通常育休がleaveStartDateから始まること', () => {
    // 産後パパ育休0日 → 通常育休はleaveStartDate当日から開始
    // startDate = leaveStartDate + 0 = '2026-11-01'
    // day180 = leaveStartDate + 179 = '2027-04-29'
    // leaveEndDate = '2027-04-29' → 180日間すべて67%
    const result = calcPapaChildcare67({
      monthlySalary: 380000,
      leaveStartDate: '2026-11-01',
      paternityDays: 0,
      leaveEndDate: '2027-04-29',
    })
    expect(result).not.toBeNull()
    expect(result!.startDate).toBe('2026-11-01')
    expect(result!.days).toBe(180)
  })

  it('leaveEndDate が産後パパ育休期間内（paternityDays以内）→ null が返る', () => {
    // leaveEndDate = leaveStartDate+27 で、産後パパ育休期間と同じ
    // 通常育休の startDate = leaveStartDate+28 > leaveEndDate → null
    const result = calcPapaChildcare67({
      monthlySalary: 380000,
      leaveStartDate: '2026-11-01',
      paternityDays: 28,
      leaveEndDate: '2026-11-28',
    })
    expect(result).toBeNull()
  })
})

// 通常育休50%日額 = floor(min(賃金日額, 16110) × 50/100)
// 対象期間: 総育休181日目（leaveStartDate+180）〜 leaveEndDate
// 総育休が180日以内の場合は null を返す
describe('育児休業給付金（パパ・後期50%）', () => {
  it('leaveEndDate="2027-08-31" → 総育休181日目以降が50%で返る', () => {
    // 50%開始日 = leaveStartDate+180 = '2027-04-30'
    // 対象日数: '2027-04-30' 〜 '2027-08-31' = 124日
    //   (Apr:1, May:31, Jun:30, Jul:31, Aug:31 = 124日)
    // 日額50% = floor(12666 × 50/100) = floor(6333) = 6333円
    // amount = 6333 × 124 = 785,292円
    const result = calcPapaChildcare50({
      monthlySalary: 380000,
      leaveStartDate: '2026-11-01',
      paternityDays: 28,
      leaveEndDate: '2027-08-31',
    })
    expect(result).not.toBeNull()
    expect(result!.type).toBe('childcare50')
    expect(result!.source).toBe('雇用保険')
    expect(result!.startDate).toBe('2027-04-30')
    expect(result!.endDate).toBe('2027-08-31')
    expect(result!.days).toBe(124)
    expect(result!.amount).toBe(785292)
  })

  it('leaveEndDate="2027-04-29"（総育休180日以内）→ null が返る', () => {
    // 50%開始日 = leaveStartDate+180 = '2027-04-30' > '2027-04-29' = leaveEndDate
    const result = calcPapaChildcare50({
      monthlySalary: 380000,
      leaveStartDate: '2026-11-01',
      paternityDays: 28,
      leaveEndDate: '2027-04-29',
    })
    expect(result).toBeNull()
  })
})
