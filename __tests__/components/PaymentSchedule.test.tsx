import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PaymentScheduleList from '../../app/components/PaymentSchedule'
import type { PaymentSchedule } from '../../app/lib/types'

const schedules: PaymentSchedule[] = [
  {
    startDate: '2026-12-28',
    endDate: '2027-02-27',
    days: 62,
    amount: 443052,
    estimatedPaymentMonth: '2027年4月中旬ごろ',
    benefitType: 'childcare67',
  },
  {
    startDate: '2027-02-28',
    endDate: '2027-04-27',
    days: 59,
    amount: 421474,
    estimatedPaymentMonth: '2027年6月中旬ごろ',
    benefitType: 'childcare67',
    isFinal: true,
  },
]

describe('PaymentScheduleList', () => {
  it('振込スケジュール一覧が描画されること', () => {
    render(<PaymentScheduleList schedules={schedules} />)
    expect(screen.getByText(/2027年4月中旬ごろ/)).toBeDefined()
    expect(screen.getByText(/2027年6月中旬ごろ/)).toBeDefined()
    expect(screen.getByText(/443,052/)).toBeDefined()
    expect(screen.getByText(/421,474/)).toBeDefined()
  })

  it('isFinal: true の行に「最終振込」バッジが表示されること', () => {
    render(<PaymentScheduleList schedules={schedules} />)
    expect(screen.getByText('最終振込')).toBeDefined()
  })
})
