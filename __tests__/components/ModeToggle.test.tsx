import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ModeToggle from '../../app/components/ModeToggle'

describe('ModeToggle', () => {
  it('パパタブをクリックすると onChange("papa") が呼ばれること', () => {
    const onChange = vi.fn()
    render(<ModeToggle mode="mama" onChange={onChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'パパ' }))
    expect(onChange).toHaveBeenCalledWith('papa')
  })

  it('ママタブをクリックすると onChange("mama") が呼ばれること', () => {
    const onChange = vi.fn()
    render(<ModeToggle mode="papa" onChange={onChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'ママ' }))
    expect(onChange).toHaveBeenCalledWith('mama')
  })
})
