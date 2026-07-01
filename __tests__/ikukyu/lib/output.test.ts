import { describe, it, expect } from 'vitest'
import { calcSummaryLabel, calcBreakdownBar, calcPaymentSchedules } from '../../../app/ikukyu/lib/calculator'
import type { BenefitItem } from '../../../app/ikukyu/lib/types'

describe('summaryLabel 生成', () => {
  it('mode: mama → "出産手当金 + 育児休業給付金の合計"', () => {
    expect(calcSummaryLabel('mama')).toBe('出産手当金 + 育児休業給付金の合計')
  })

  it('mode: papa → "出生時育児休業給付金 + 育児休業給付金の合計"', () => {
    expect(calcSummaryLabel('papa')).toBe('出生時育児休業給付金 + 育児休業給付金の合計')
  })
})

// BreakdownBar の期待値:
//   mama dueDate='2026-11-01', leaveEndDate='2027-10-31':
//     産休:     getMaternityStartDate('2026-11-01') ~ getPostnatalEndDate('2026-11-01') = 98日
//     育休67%:  getMamaLeaveStartDate('2026-11-01')='2026-12-28' + 180日目 = '2027-06-25' = 180日
//     育休50%:  '2027-06-26' ~ '2027-10-31' = 128日
//
//   papa dueDate='2026-11-01', leaveEndDate='2027-04-29'（総育休180日目）:
//     産後パパ育休: '2026-11-01' ~ '2026-11-28' = 28日
//     育休67%:     '2026-11-29' ~ '2027-04-29' = 152日
//     ※ leaveEndDate='2027-04-29'=総育休180日目 なので50%は発生しない
describe('BreakdownBarSegment[] 生成', () => {
  it('mama: 産休・育休67%・育休50%の3区分が返ること', () => {
    const result = calcBreakdownBar({ mode: 'mama', dueDate: '2026-11-01', leaveEndDate: '2027-10-31' })
    expect(result).toHaveLength(3)
    expect(result[0].label).toBe('産休')
    expect(result[0].days).toBe(98)
    expect(result[1].label).toBe('育休（前期）')
    expect(result[1].days).toBe(180)
    expect(result[2].label).toBe('育休（後期）')
    expect(result[2].days).toBe(128)
  })

  it('papa（育休180日以内）: 産後パパ育休・育休67%の2区分が返ること', () => {
    // dueDate=出産予定日, leaveStartDate=育休開始日（同日 = 出産当日から休む）
    const result = calcBreakdownBar({ mode: 'papa', dueDate: '2026-11-01', leaveStartDate: '2026-11-01', leaveEndDate: '2027-04-29' })
    expect(result).toHaveLength(2)
    expect(result[0].label).toBe('産後パパ育休')
    expect(result[0].days).toBe(28)
    expect(result[1].label).toBe('育休（前期）')
    expect(result[1].days).toBe(152)
  })
})

// PaymentSchedule の期待値:
//   childcare67: '2026-12-28' ~ '2027-06-25' (180日)
//   splitIntoTwoMonthBlocks で3ブロックに分割:
//     Block 1: '2026-12-28' ~ '2027-02-27'  終了月2027-02 +2ヶ月 → "2027年4月中旬ごろ"
//     Block 2: '2027-02-28' ~ '2027-04-27'  終了月2027-04 +2ヶ月 → "2027年6月中旬ごろ"
//     Block 3: '2027-04-28' ~ '2027-06-25'  終了月2027-06 +2ヶ月 → "2027年8月中旬ごろ"（最終）
describe('PaymentSchedule[] 生成', () => {
  const childcare67: BenefitItem = {
    type: 'childcare67',
    officialName: '育児休業（育休）最初の180日',
    source: '雇用保険',
    startDate: '2026-12-28',
    endDate: '2027-06-25',
    days: 180,
    rateLabel: '休業前賃金の67%',
    amount: 1286280,
    bonusAmount: 38808,
    dailyLimitReached: false,
  }

  it('各ブロックの estimatedPaymentMonth が「終了月 + 2ヶ月・中旬ごろ」になること', () => {
    const schedules = calcPaymentSchedules([childcare67])
    expect(schedules[0].estimatedPaymentMonth).toBe('2027年4月中旬ごろ')
    expect(schedules[1].estimatedPaymentMonth).toBe('2027年6月中旬ごろ')
    expect(schedules[2].estimatedPaymentMonth).toBe('2027年8月中旬ごろ')
  })

  it('最後のブロックの isFinal が true になること', () => {
    const schedules = calcPaymentSchedules([childcare67])
    const last = schedules[schedules.length - 1]
    expect(last.isFinal).toBe(true)
  })

  it('bonusAmount は最初のブロックの amount に上乗せされること', () => {
    // 出生後休業支援給付金は育児休業給付金と同時に支払われるため最初のブロックに加算する
    // dailyRate = floor(1286280 / 180) = 7146
    // Block 1: '2026-12-28' ~ '2027-02-27' = 62日 → 7146×62 + 38808 = 481,860
    // Block 2: '2027-02-28' ~ '2027-04-27' = 59日 → 7146×59 = 421,614（bonus なし）
    const schedules = calcPaymentSchedules([childcare67])
    expect(schedules[0].amount).toBe(7146 * 62 + 38808)
    expect(schedules[1].amount).toBe(7146 * 59)
  })

  it('bonusAmount がない給付は amount が変化しないこと', () => {
    const noBonus: BenefitItem = { ...childcare67, bonusAmount: undefined }
    const schedules = calcPaymentSchedules([noBonus])
    expect(schedules[0].amount).toBe(7146 * 62)
  })
})
