'use client'
import type { Mode } from '../lib/types'

type Props = {
  mode: Mode
  onChange: (mode: Mode) => void
}

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div role="tablist" className="flex rounded-full bg-gray-100 p-1">
      <button
        role="tab"
        aria-selected={mode === 'mama'}
        onClick={() => onChange('mama')}
        className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
          mode === 'mama' ? 'bg-gray-900 text-white' : 'text-gray-500'
        }`}
      >
        ママ
      </button>
      <button
        role="tab"
        aria-selected={mode === 'papa'}
        onClick={() => onChange('papa')}
        className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
          mode === 'papa' ? 'bg-gray-900 text-white' : 'text-gray-500'
        }`}
      >
        パパ
      </button>
    </div>
  )
}
