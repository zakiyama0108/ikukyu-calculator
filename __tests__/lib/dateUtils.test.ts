import { describe, it, expect } from 'vitest'
import {
  getMaternityStartDate,
  getPostnatalEndDate,
  getChildcareLeaveStartDate,
  splitIntoTwoMonthBlocks,
} from '../../app/lib/dateUtils'

// 産前42日 = 出産予定日を含む42日間なので「dueDate - 41日」で開始日を算出する
describe('産前開始日 (dueDate - 41日)', () => {
  it('通常ケース: dueDate="2026-11-01" → "2026-09-21"', () => {
    expect(getMaternityStartDate('2026-11-01')).toBe('2026-09-21')
  })

  // 2月は28日しかないため、月境界で日数がずれないことを確認する
  it('2月をまたぐケース: dueDate="2026-03-01" → "2026-01-19"', () => {
    expect(getMaternityStartDate('2026-03-01')).toBe('2026-01-19')
  })

  // 1月初旬の予定日は前年12月にまたがるため、年をまたぐ処理を確認する
  it('年をまたぐケース: dueDate="2027-01-15" → "2026-12-05"', () => {
    expect(getMaternityStartDate('2027-01-15')).toBe('2026-12-05')
  })
})

// 産後56日 = 出産翌日を1日目として56日間なので「dueDate + 56日」で終了日を算出する
describe('産後終了日 (dueDate + 56日)', () => {
  it('通常ケース: dueDate="2026-11-01" → "2026-12-27"', () => {
    expect(getPostnatalEndDate('2026-11-01')).toBe('2026-12-27')
  })

  // 11月は30日しかないため、年をまたぐ処理を確認する
  it('年をまたぐケース: dueDate="2026-11-10" → "2027-01-05"', () => {
    expect(getPostnatalEndDate('2026-11-10')).toBe('2027-01-05')
  })
})

// 育休は産後休業終了日の翌日から開始するため「dueDate + 57日」で算出する
describe('育休開始日 (産後終了日の翌日)', () => {
  it('通常ケース: dueDate="2026-11-01" → "2026-12-28"', () => {
    expect(getChildcareLeaveStartDate('2026-11-01')).toBe('2026-12-28')
  })

  // 産後終了日が12/31になる場合、育休開始は翌年1/1になることを確認する
  it('産後終了日が12/31になるケース: dueDate="2026-11-05" → "2027-01-01"', () => {
    expect(getChildcareLeaveStartDate('2026-11-05')).toBe('2027-01-01')
  })
})

// 給付金は2ヶ月ごとに申請するため、育休期間を2ヶ月ブロックに分割する
describe('2ヶ月ブロック分割', () => {
  it('育休が約4ヶ月の場合、2ブロックに分割される', () => {
    const result = splitIntoTwoMonthBlocks('2026-11-01', '2027-04-30')
    expect(result).toHaveLength(2)
    expect(result[0].startDate).toBe('2026-12-28')
    expect(result[result.length - 1].endDate).toBe('2027-04-30')
  })

  // 端数が1ヶ月以上ある場合は別ブロックとして追加する
  it('最後のブロックが端数（約1ヶ月）の場合、3ブロックになる', () => {
    const result = splitIntoTwoMonthBlocks('2026-11-01', '2027-05-31')
    expect(result).toHaveLength(3)
    expect(result[0].startDate).toBe('2026-12-28')
    expect(result[result.length - 1].endDate).toBe('2027-05-31')
  })

  // 育休が2ヶ月未満の場合は1ブロックのみで全期間を表す
  it('育休が2ヶ月未満の場合、1ブロックのみになる', () => {
    const result = splitIntoTwoMonthBlocks('2026-11-01', '2027-01-31')
    expect(result).toHaveLength(1)
    expect(result[0].startDate).toBe('2026-12-28')
    expect(result[0].endDate).toBe('2027-01-31')
  })
})
