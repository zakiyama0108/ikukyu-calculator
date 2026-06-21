'use client'

import { useState } from 'react'
import ModeToggle from './components/ModeToggle'
import InputForm from './components/InputForm'
import ResultSummary from './components/ResultSummary'
import BenefitCard from './components/BenefitCard'
import PaymentSchedule from './components/PaymentSchedule'

// ガワ確認用のダミーデータ（計算ロジック実装後に差し替える）
const MAMA_RESULT = {
  totalAmount: 3395200,
  summaryLabel: '出産手当金 + 育児休業給付金の合計',
  segments: [
    { label: '産休・98日', days: 98, colorClass: 'bg-pink-400' },
    { label: '育休67%・180日', days: 180, colorClass: 'bg-orange-400' },
    { label: '育休50%・152日', days: 152, colorClass: 'bg-yellow-300' },
  ],
}

const MAMA_BENEFITS = [
  {
    badge: '産',
    badgeBgClass: 'bg-blue-100',
    badgeTextClass: 'text-blue-600',
    name: '出産手当金',
    amount: 631200,
    officialName: '産前産後休業（産休）',
    source: '健康保険' as const,
    period: '2026/9/21〜2027/1/2（98日）',
    rateLabel: '標準報酬日額の2/3',
    dailyLimitReached: false,
  },
  {
    badge: '67%',
    badgeBgClass: 'bg-orange-100',
    badgeTextClass: 'text-orange-600',
    name: '育児休業給付金',
    amount: 1286400,
    officialName: '育児休業（育休）最初の180日',
    source: '雇用保険' as const,
    period: '2027/1/3〜2027/7/1（180日）',
    rateLabel: '休業前賃金の67%',
    dailyLimitReached: false,
  },
  {
    badge: '50%',
    badgeBgClass: 'bg-yellow-100',
    badgeTextClass: 'text-yellow-700',
    name: '育児休業給付金',
    amount: 1477600,
    officialName: '育児休業（育休）181日以降',
    source: '雇用保険' as const,
    period: '2027/7/2〜2027/10/31（152日）',
    rateLabel: '休業前賃金の50%',
    dailyLimitReached: false,
  },
]

const MAMA_SCHEDULES = [
  { period: '対象期間：2026/9/21〜9/30（10日）', amount: 64400, estimatedPaymentMonth: '2026年12月上旬ごろ', benefitLabel: '出産手当金' },
  { period: '対象期間：2026/10/1〜11/30（61日）', amount: 392840, estimatedPaymentMonth: '2027年1月下旬ごろ', benefitLabel: '出産手当金' },
  { period: '対象期間：2026/12/1〜2027/1/2（33日）', amount: 187720, estimatedPaymentMonth: '2027年3月上旬ごろ', benefitLabel: '出産手当金' },
  { period: '対象期間：2027/1/3〜2/28（57日）', amount: 407360, estimatedPaymentMonth: '2027年4月中旬ごろ', benefitLabel: '育休給付金67%' },
  { period: '対象期間：2027/3/1〜4/30（61日）', amount: 436168, estimatedPaymentMonth: '2027年6月中旬ごろ', benefitLabel: '育休給付金67%' },
  { period: '対象期間：2027/5/1〜6/30（61日）', amount: 386720, estimatedPaymentMonth: '2027年8月中旬ごろ', benefitLabel: '育休給付金67%' },
  { period: '対象期間：2027/7/1〜8/31（62日）', amount: 330968, estimatedPaymentMonth: '2027年10月中旬ごろ', benefitLabel: '育休給付金50%' },
  { period: '対象期間：2027/9/1〜10/31（61日）', amount: 325648, estimatedPaymentMonth: '2027年12月中旬ごろ', benefitLabel: '育休給付金50%', isFinal: true },
]

const PAPA_RESULT = {
  totalAmount: 1652440,
  summaryLabel: '出生時育児休業給付金 + 育児休業給付金の合計',
  segments: [
    { label: '産後パパ育休・28日', days: 28, colorClass: 'bg-purple-400' },
    { label: '育休67%・122日', days: 122, colorClass: 'bg-orange-400' },
  ],
}

const PAPA_BENEFITS = [
  {
    badge: '28日',
    badgeBgClass: 'bg-purple-100',
    badgeTextClass: 'text-purple-600',
    name: '出生時育児休業給付金',
    amount: 412280,
    officialName: '出生時育休（産後パパ育休）',
    source: '雇用保険' as const,
    period: '2026/11/1〜11/28（28日）',
    rateLabel: '休業前賃金の67%',
    dailyLimitReached: false,
    bonusAmount: 75440,
  },
  {
    badge: '67%',
    badgeBgClass: 'bg-orange-100',
    badgeTextClass: 'text-orange-600',
    name: '育児休業給付金',
    amount: 1240160,
    officialName: '育児休業（育休）最初の180日以内',
    source: '雇用保険' as const,
    period: '2026/11/29〜2027/4/30（122日）',
    rateLabel: '休業前賃金の67%',
    dailyLimitReached: false,
  },
]

const PAPA_SCHEDULES = [
  { period: '対象期間：2026/11/1〜11/28（28日）', amount: 412280, estimatedPaymentMonth: '2027年1月中旬ごろ', benefitLabel: '出生時育児休業給付金' },
  { period: '対象期間：2026/11/29〜12/31（33日）', amount: 355960, estimatedPaymentMonth: '2027年2月下旬ごろ', benefitLabel: '育休給付金67%' },
  { period: '対象期間：2027/1/1〜2/28（59日）', amount: 635608, estimatedPaymentMonth: '2027年4月中旬ごろ', benefitLabel: '育休給付金67%' },
  { period: '対象期間：2027/3/1〜4/30（61日）', amount: 248592, estimatedPaymentMonth: '2027年6月下旬ごろ', benefitLabel: '育休給付金67%', isFinal: true },
]

const NOTICE_MAMA = '出産手当金・育児休業給付金はいずれも非課税です。所得税・住民税はかかりません。産休・育休中は社会保険料も原則免除されるため、表示額がそのまま手取りの目安になります。'
const NOTICE_PAPA = '出生時育児休業給付金・育児休業給付金はいずれも非課税です。所得税・住民税はかかりません。育休中は社会保険料も原則免除されるため、表示額がそのまま手取りの目安になります。'

export default function Page() {
  const [mode, setMode] = useState<'mama' | 'papa'>('mama')

  const result = mode === 'mama' ? MAMA_RESULT : PAPA_RESULT
  const benefits = mode === 'mama' ? MAMA_BENEFITS : PAPA_BENEFITS
  const schedules = mode === 'mama' ? MAMA_SCHEDULES : PAPA_SCHEDULES
  const notice = mode === 'mama' ? NOTICE_MAMA : NOTICE_PAPA

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">出産・育休 給付金シミュレーター</h1>
        <p className="mt-1 text-sm text-gray-500">産後から育休まで、もらえるお金が全部わかる</p>
      </div>

      {/* モード切替 */}
      <ModeToggle mode={mode} onChange={setMode} />

      {/* 入力フォーム */}
      <InputForm mode={mode} />

      {/* 結果エリア */}
      <ResultSummary
        totalAmount={result.totalAmount}
        summaryLabel={result.summaryLabel}
        segments={result.segments}
      />

      {/* 給付金カード */}
      <div className="space-y-3">
        {benefits.map((b, i) => (
          <BenefitCard key={i} {...b} />
        ))}
      </div>

      {/* 注意書き */}
      <p className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500 leading-relaxed">
        {notice}
      </p>

      {/* 振込スケジュール */}
      <PaymentSchedule items={schedules} />
    </div>
  )
}
