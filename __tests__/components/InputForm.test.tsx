import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InputForm from '../../app/components/InputForm'

describe('InputForm', () => {
  it('月給・出産予定日・育休終了予定日を入力して送信すると CalculatorInput が返ること', () => {
    const onSubmit = vi.fn()
    render(<InputForm mode="mama" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/月給/), { target: { value: '320000' } })
    fireEvent.change(screen.getByLabelText(/出産予定日/), { target: { value: '2026-11-01' } })
    fireEvent.change(screen.getByLabelText(/育休終了予定日/), { target: { value: '2027-10-31' } })
    fireEvent.click(screen.getByRole('button', { name: '計算する' }))

    expect(onSubmit).toHaveBeenCalledWith({
      mode: 'mama',
      monthlySalary: 320000,
      dueDate: '2026-11-01',
      leaveEndDate: '2027-10-31',
    })
  })

  it('mode: papa のとき出産予定日ラベルが「配偶者の出産予定日」になること', () => {
    render(<InputForm mode="papa" onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('配偶者の出産予定日')).toBeDefined()
  })

  it('月給が未入力のとき onSubmit が呼ばれないこと', () => {
    const onSubmit = vi.fn()
    render(<InputForm mode="mama" onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText(/出産予定日/), { target: { value: '2026-11-01' } })
    fireEvent.change(screen.getByLabelText(/育休終了予定日/), { target: { value: '2027-10-31' } })
    fireEvent.click(screen.getByRole('button', { name: '計算する' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('日付が未入力のとき onSubmit が呼ばれないこと', () => {
    const onSubmit = vi.fn()
    render(<InputForm mode="mama" onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText(/月給/), { target: { value: '320000' } })
    fireEvent.click(screen.getByRole('button', { name: '計算する' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
