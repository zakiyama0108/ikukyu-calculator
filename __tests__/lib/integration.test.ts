import { describe, it, expect } from 'vitest'
import { calcResult } from '../../app/lib/calculator'

// Section 8 総合確認 — calcResult を通じてエッジケースを検証する

describe('上限到達ケース（月給483,300円超）', () => {
  it('ママ: 月給500,000円 → 雇用保険の給付金は日額上限16,110円が適用されること', () => {
    // wageDaily = floor(500000/30) = 16666 > 16110 → dailyLimitReached: true
    const result = calcResult({
      mode: 'mama',
      monthlySalary: 500000,
      dueDate: '2026-11-01',
      leaveEndDate: '2027-10-31',
    })
    // 出産手当金（健保）: floor(500000/30*2/3) = 11111 < 30887 → 上限未達
    expect(result.benefits[0].type).toBe('maternity')
    expect(result.benefits[0].dailyLimitReached).toBe(false)
    // 育休67%（雇用保険）: 上限到達
    expect(result.benefits[1].type).toBe('childcare67')
    expect(result.benefits[1].dailyLimitReached).toBe(true)
    // 育休50%（雇用保険）: 上限到達
    expect(result.benefits[2].type).toBe('childcare50')
    expect(result.benefits[2].dailyLimitReached).toBe(true)
  })

  it('パパ: 月給500,000円 → 全給付金で dailyLimitReached: true になること', () => {
    const result = calcResult({
      mode: 'papa',
      monthlySalary: 500000,
      dueDate: '2026-11-01',
      leaveEndDate: '2027-04-29',
    })
    expect(result.benefits.every(b => b.dailyLimitReached)).toBe(true)
  })
})

describe('育休が極端に短いケース（28日未満）', () => {
  it('ママ: 育休14日 → bonusAmount が14日分になり childcare50 が発生しないこと', () => {
    // leaveStart = 2026-12-28, leaveEnd = 2027-01-10（14日間）
    const result = calcResult({
      mode: 'mama',
      monthlySalary: 320000,
      dueDate: '2026-11-01',
      leaveEndDate: '2027-01-10',
    })
    const c67 = result.benefits.find(b => b.type === 'childcare67')!
    expect(c67.days).toBe(14)
    // bonusDays = min(28, 14) = 14。日額13% = floor(10666 × 13/100) = 1386円
    expect(c67.bonusAmount).toBe(Math.floor(Math.floor(320000 / 30) * 13 / 100) * 14)
    expect(result.benefits.find(b => b.type === 'childcare50')).toBeUndefined()
  })

  it('パパ: 産後パパ育休のみ（leaveEndDate = paternityEndDate）→ childcare67 が含まれないこと', () => {
    // dueDate + 27 = 2026-11-28 = 産後パパ育休終了日と同じ = 育休なし
    const result = calcResult({
      mode: 'papa',
      monthlySalary: 380000,
      dueDate: '2026-11-01',
      leaveEndDate: '2026-11-28',
    })
    expect(result.benefits.find(b => b.type === 'paternity')).toBeDefined()
    expect(result.benefits.find(b => b.type === 'childcare67')).toBeUndefined()
    expect(result.benefits.find(b => b.type === 'childcare50')).toBeUndefined()
  })
})

describe('パパの育休合計が180日超のケース', () => {
  it('leaveEndDate が dueDate+180日超 → childcare50 が発生すること', () => {
    // dueDate + 180 = 2027-04-30 が childcare50 の開始日
    const result = calcResult({
      mode: 'papa',
      monthlySalary: 380000,
      dueDate: '2026-11-01',
      leaveEndDate: '2027-06-30',
    })
    const c50 = result.benefits.find(b => b.type === 'childcare50')
    expect(c50).toBeDefined()
    expect(c50!.startDate).toBe('2027-04-30')
    expect(c50!.endDate).toBe('2027-06-30')
  })
})
