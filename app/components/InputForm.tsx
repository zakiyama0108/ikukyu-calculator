'use client'
import { useState } from 'react'
import type { CalculatorInput, Mode } from '../lib/types'

type Props = {
  mode: Mode
  onSubmit: (input: CalculatorInput) => void
}

export default function InputForm({ mode, onSubmit }: Props) {
  const [monthlySalary, setMonthlySalary] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [leaveEndDate, setLeaveEndDate] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const salary = Number(monthlySalary.replace(/,/g, ''))
    if (!salary || salary <= 0 || !dueDate || !leaveEndDate) return
    onSubmit({ mode, monthlySalary: salary, dueDate, leaveEndDate })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="monthlySalary" className="block text-sm text-gray-500">
          月給（手取り前の総支給額）
        </label>
        <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
          <input
            id="monthlySalary"
            type="text"
            value={monthlySalary}
            onChange={e => setMonthlySalary(e.target.value)}
            placeholder="320000"
            className="flex-1 px-4 py-3 text-base outline-none"
          />
          <span className="pr-4 text-gray-400 text-sm">円</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dueDate" className="block text-sm text-gray-500">
            {/* パパは自身が産む訳ではないため配偶者の出産予定日に切り替える */}
            {mode === 'mama' ? '出産予定日' : '配偶者の出産予定日'}
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none"
          />
        </div>
        <div>
          <label htmlFor="leaveEndDate" className="block text-sm text-gray-500">育休終了予定日</label>
          <input
            id="leaveEndDate"
            type="date"
            value={leaveEndDate}
            onChange={e => setLeaveEndDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none"
          />
        </div>
      </div>

      <button type="submit" className="w-full rounded-xl bg-orange-500 py-4 text-base font-medium text-white">
        計算する
      </button>
    </form>
  )
}
