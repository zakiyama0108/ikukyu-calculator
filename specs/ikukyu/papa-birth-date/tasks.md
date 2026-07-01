# タスク分解: パパモードへの出産予定日入力追加

> TDDで進める。各機能ごとに 🔴 Red → 🟢 Green → 🔵 Refactor のサイクルを完結させる。

## ステータス: 完了（PR #14）

- [x] Task 1: 型変更
  - [x] `CalculatorInput` に `leaveStartDate?: string` を追加
  - [x] `PapaLeaveInput`（private）を `leaveStartDate + paternityDays` 形式に変更

- [x] Task 2: 計算ロジック更新
  - [x] `calcPapaChildcare67`: dueDate → leaveStartDate + paternityDays で計算
  - [x] `calcPapaChildcare50`: dueDate → leaveStartDate で計算
  - [x] `calcResult`（papa branch）: paternityDays を計算して各関数に渡す
  - [x] `calcBreakdownBar`（papa branch）: leaveStartDate を起点に可視化

- [x] Task 3: UI更新
  - [x] `InputForm`（パパモード）: 出産予定日 + 育休開始日 + 育休終了予定日 の3入力に変更
  - [x] `handleSubmit`: leaveStartDate も onSubmit に含める

- [x] Task 4: テスト更新
  - [x] `papaCalculator.test.ts`: PapaLeaveInput の引数を新形式に
  - [x] `output.test.ts`: calcBreakdownBar の papa 引数に leaveStartDate 追加
  - [x] `integration.test.ts`: papa calcResult 引数に leaveStartDate 追加
  - [x] `InputForm.test.tsx`: パパモードの新規フィールド対応
  - [x] 新規テスト: 育休開始日が8週間超 → paternityDays=0
  - [x] 新規テスト: 育休開始日が8週間内の終盤 → paternityDays<28
