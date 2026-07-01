import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ikukyu | 育休・出産のお金ツール',
  description: '育休・出産に関するお金のことをサポートするツールを提供しています。',
}

export default function HubPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 space-y-10">
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">ikukyu</h1>
        <p className="text-sm text-gray-500">育休・出産のお金をサポートするツール</p>
      </div>

      {/* ツールカード一覧 */}
      <div className="space-y-4">
        <Link
          href="/ikukyu"
          className="block rounded-2xl border border-gray-200 bg-white p-6 hover:border-orange-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">🧮</span>
            <div>
              <h2 className="text-base font-bold text-gray-900">育休給付金シミュレーター</h2>
              <p className="mt-1 text-sm text-gray-500">
                産後から育休まで、もらえる給付金が全部わかる
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
