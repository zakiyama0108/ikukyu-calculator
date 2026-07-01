# 設計: パパモードへの出産予定日入力追加

## 型定義の変更

### `CalculatorInput`（app/lib/types.ts）
```ts
type CalculatorInput = {
  mode: Mode
  monthlySalary: number
  dueDate: string          // 出産予定日（ママ・パパ共通）
  leaveStartDate?: string  // パパのみ: 育休開始日（産後パパ育休の初日）
  leaveEndDate: string
}
```

### `PapaLeaveInput`（calculator.ts内・private）
```ts
type PapaLeaveInput = {
  monthlySalary: number
  leaveStartDate: string  // 育休開始日（給付計算の起点）
  paternityDays: number   // 実際の産後パパ育休取得日数（0〜28）
  leaveEndDate: string
}
```

## 計算ロジック変更

### paternityDays の決定（calcResult内）
```
paternityWindowEnd = dueDate + 56日  ← 8週間の最終日
if leaveStartDate > paternityWindowEnd → paternityDays = 0
else:
  remainingWindow = countDays(leaveStartDate, paternityWindowEnd)
  totalLeaveDays  = countDays(leaveStartDate, leaveEndDate)
  paternityDays   = min(28, remainingWindow, totalLeaveDays)
```

### calcPapaChildcare67 の変更
- 入力: `PapaLeaveInput`（leaveStartDate + paternityDays）
- startDate = leaveStartDate + paternityDays（産後パパ育休終了翌日）
- day180   = leaveStartDate + 179日（産後パパ育休を通算した180日目）

### calcPapaChildcare50 の変更
- 入力: `PapaLeaveInput`
- day181 = leaveStartDate + 180日（変更なし、起点がleaveStartDateになるだけ）

### calcBreakdownBar の変更
- 入力に `leaveStartDate?: string` を追加
- パパbranch: dueDate（出産予定日）からpaternityDaysを計算して可視化に使う

## UI変更

### InputForm（パパモード）
- 出産予定日（dueDate）: 新規追加
- 育休開始日（leaveStartDate）: 既存の日付入力欄をリネーム
- 育休終了予定日（leaveEndDate）: 変更なし
- レイアウト: 出産予定日 | 育休開始日 を1行、育休終了予定日 を1行
