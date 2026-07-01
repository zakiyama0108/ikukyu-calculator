# 設計: 育休給付金シミュレーター

## 使用技術

| 種別 | 技術 |
|------|------|
| フレームワーク | Next.js（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| テスト | Vitest |

## フォルダ構成

```
app/
  ikukyu/
    layout.tsx        # /ikukyu 専用メタ情報
    page.tsx          # 計算機ページ（'use client'）
  components/
    ModeToggle.tsx
    InputForm.tsx
    ResultSummary.tsx
    BenefitCard.tsx
    PaymentSchedule.tsx
  lib/
    types.ts          # 型定義
    calculator.ts     # 給付金計算ロジック
    dateUtils.ts      # 日付ユーティリティ
```

## 型定義（主要）

```ts
type Mode = 'mama' | 'papa'

type CalculatorInput = {
  mode: Mode
  monthlySalary: number
  dueDate: string          // 出産予定日（YYYY-MM-DD）
  leaveStartDate?: string  // パパのみ: 育休開始日
  leaveEndDate: string
}

type BenefitItem = {
  type: BenefitType
  officialName: string
  source: string
  startDate: string
  endDate: string
  days: number
  rateLabel: string
  amount: number
  bonusAmount?: number
  dailyLimitReached: boolean
}

type CalculatorResult = {
  benefits: BenefitItem[]
  paymentSchedules: PaymentSchedule[]
}
```

## 給付金計算の概要

| 給付金 | 対象 | 計算の根拠 |
|-------|------|-----------|
| 出産手当金 | ママ | 産前42日〜産後56日、日額×2/3 |
| 出生時育児休業給付金 | パパ | 出生後8週以内・最大28日、日額×67% |
| 育休給付金（67%） | 両 | 育休開始〜180日目、日額×67%（+13%上乗せあり） |
| 育休給付金（50%） | 両 | 181日目以降〜育休終了、日額×50% |

## メタ情報

| ページ | title | description |
|-------|-------|-------------|
| `/ikukyu` | 育休給付金シミュレーター \| ikukyu | 産後から育休まで、もらえる給付金が全部わかる無料シミュレーターです。 |
