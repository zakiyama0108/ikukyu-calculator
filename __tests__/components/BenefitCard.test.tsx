import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BenefitCard from '../../app/components/BenefitCard'
import type { BenefitItem } from '../../app/lib/types'

const childcare67: BenefitItem = {
  type: 'childcare67',
  officialName: '育児休業（育休）最初の180日',
  source: '雇用保険',
  startDate: '2026-12-28',
  endDate: '2027-06-25',
  days: 180,
  rateLabel: '休業前賃金の67%',
  amount: 1286280,
  dailyLimitReached: false,
}

const childcare67WithBonus: BenefitItem = {
  ...childcare67,
  bonusAmount: 38808,
}

describe('BenefitCard', () => {
  it('給付金名・財源・期間・金額・給付率が描画されること', () => {
    render(<BenefitCard benefit={childcare67} />)
    expect(screen.getByText('育児休業（育休）最初の180日')).toBeDefined()
    expect(screen.getByText(/雇用保険/)).toBeDefined()
    expect(screen.getByText(/1,286,280/)).toBeDefined()
    expect(screen.getByText('休業前賃金の67%')).toBeDefined()
  })

  it('bonusAmount がある場合に上乗せ額（+13%）の内訳が表示されること', () => {
    render(<BenefitCard benefit={childcare67WithBonus} />)
    expect(screen.getByText(/38,808/)).toBeDefined()
  })

  it('dailyLimitReached: true のとき「上限適用」が表示されること', () => {
    render(<BenefitCard benefit={{ ...childcare67, dailyLimitReached: true }} />)
    expect(screen.getByText('上限適用')).toBeDefined()
  })

  it('dailyLimitReached: false のとき「未到達」が表示されること', () => {
    render(<BenefitCard benefit={childcare67} />)
    expect(screen.getByText('未到達')).toBeDefined()
  })

  it('isNotApplicable: true のとき「対象外」バナーが表示されること', () => {
    render(<BenefitCard benefit={childcare67} isNotApplicable />)
    expect(screen.getByText('対象外')).toBeDefined()
  })
})
