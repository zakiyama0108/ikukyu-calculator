# タスク分解: パパモードへの出産予定日入力追加

## Task 1: 型変更
- [ ] `CalculatorInput` に `leaveStartDate?: string` を追加
- [ ] `PapaLeaveInput`（private）を `leaveStartDate + paternityDays` 形式に変更

## Task 2: 計算ロジック更新
- [ ] `calcPapaChildcare67`: dueDate → leaveStartDate + paternityDays で計算
- [ ] `calcPapaChildcare50`: dueDate → leaveStartDate で計算
- [ ] `calcResult`（papa branch）: paternityDays を計算して各関数に渡す
- [ ] `calcBreakdownBar`（papa branch）: leaveStartDate を起点に可視化

## Task 3: UI更新
- [ ] `InputForm`（パパモード）: 出産予定日 + 育休開始日 + 育休終了予定日 の3入力に変更
- [ ] `handleSubmit`: leaveStartDate も onSubmit に含める

## Task 4: テスト更新
- [ ] `papaCalculator.test.ts`: PapaLeaveInput の引数を新形式に
- [ ] `output.test.ts`: calcBreakdownBar の papa 引数に leaveStartDate 追加
- [ ] `integration.test.ts`: papa calcResult 引数に leaveStartDate 追加
- [ ] `InputForm.test.tsx`: パパモードの新規フィールド対応
- [ ] 新規テスト追加: 育休開始日が8週間超 → paternityDays=0
- [ ] 新規テスト追加: 育休開始日が8週間内の終盤 → paternityDays<28
