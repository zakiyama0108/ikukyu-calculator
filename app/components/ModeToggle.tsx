'use client'

// ママ/パパの計算モードを表す型
type Mode = 'mama' | 'papa'

// 現在のモードと切替コールバックを受け取る
type Props = {
  mode: Mode
  onChange: (mode: Mode) => void
}

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex rounded-full bg-gray-100 p-1">
      <button
        onClick={() => onChange('mama')}
        className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
          mode === 'mama' ? 'bg-gray-900 text-white' : 'text-gray-500'
        }`}
      >
        ママ
      </button>
      <button
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
