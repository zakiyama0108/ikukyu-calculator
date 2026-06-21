// ママ/パパの計算モードを表す型
type Mode = 'mama' | 'papa'

// modeによってラベルと計算対象が変わる
type Props = {
  mode: Mode
}

export default function InputForm({ mode }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-500">
          休業前の月給（手取り前の総支給額）
        </label>
        <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
          <input
            type="text"
            defaultValue="320,000"
            className="flex-1 px-4 py-3 text-base outline-none"
          />
          <span className="pr-4 text-gray-400 text-sm">円</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-500">
            {/* パパは自身が産む訳ではないため配偶者の出産予定日に切り替える */}
            {mode === 'mama' ? '出産予定日' : '配偶者の出産予定日'}
          </label>
          {/* プレースホルダーはYY/MM/DD形式 */}
          <input
            type="text"
            defaultValue="26/11/01"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500">育休終了予定日</label>
          <input
            type="text"
            defaultValue="27/10/31"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none"
          />
        </div>
      </div>

      <button className="w-full rounded-xl bg-orange-500 py-4 text-base font-medium text-white">
        計算する
      </button>
    </div>
  )
}
