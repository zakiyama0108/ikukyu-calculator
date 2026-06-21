# タスク（Tasks）

> TDDで進める。各機能ごとに 🔴 Red → 🟢 Green → 🔵 Refactor のサイクルを完結させてから次へ進む。

## ステータス凡例
- [ ] 未着手
- [x] 完了

---

## 0. UIガワ作成（ハードコードで見た目を作る）

ロジックなし・ダミーデータで画面の見た目を先に完成させる。TDDの対象外。

- [ ] `app/page.tsx` にタイトル・キャッチコピーを配置する
- [ ] `ModeToggle.tsx` を作成する（ママ/パパ切替タブ、スタイルのみ）
- [ ] `InputForm.tsx` を作成する（月給・出産予定日・育休終了予定日・計算ボタン）
- [ ] `ResultSummary.tsx` を作成する（合計金額・summaryLabel・内訳バーをダミー値で表示）
- [ ] `BenefitCard.tsx` を作成する（給付金名・財源バッジ・期間・金額・給付率をダミー値で表示）
- [ ] `PaymentSchedule.tsx` を作成する（振込スケジュール一覧をダミー値で表示）
- [ ] 全コンポーネントを `app/page.tsx` に組み込んでスマホ表示（375px）を目視確認する

---

## 1. 型定義（lib/types.ts）

型はコンパイラが保証するためテスト不要。最初に定義しておく。

- [ ] `Mode`, `CalculatorInput`
- [ ] `BenefitType`, `BenefitItem`
- [ ] `PaymentSchedule`, `BreakdownBarSegment`, `CalculatorResult`

---

## 2. 日付・期間ユーティリティ

入力は `CalculatorInput` の `dueDate` と `leaveEndDate` のみ使用（`mode` / `monthlySalary` は不要）。

### 🔴 Red
- [ ] 産前開始日のテストを書く（入力: `dueDate`）
  - `dueDate: '2026-11-01'` → `'2026-09-21'`（通常ケース）
  - `dueDate: '2026-03-01'` → `'2026-01-19'`（2月をまたぐケース）
  - `dueDate: '2027-01-15'` → `'2026-12-04'`（年をまたぐケース）
- [ ] 産後終了日のテストを書く（入力: `dueDate`）
  - `dueDate: '2026-11-01'` → `'2026-12-27'`（通常ケース）
  - `dueDate: '2026-11-10'` → `'2027-01-05'`（年をまたぐケース）
- [ ] 育休開始日のテストを書く（入力: `dueDate`）
  - `dueDate: '2026-11-01'` → `'2026-12-28'`（産後終了日の翌日）
  - `dueDate: '2026-11-05'` → `'2027-01-01'`（産後終了日が12/31になるケース）
- [ ] 2ヶ月ブロック分割のテストを書く（入力: `dueDate` + `leaveEndDate`）
  - `dueDate: '2026-11-01', leaveEndDate: '2027-04-30'` → 2ブロック（各約2ヶ月）に分割されること
  - `dueDate: '2026-11-01', leaveEndDate: '2027-05-31'` → 最後のブロックが端数（1ヶ月）になること
  - `dueDate: '2026-11-01', leaveEndDate: '2027-01-31'` → 育休が2ヶ月未満で1ブロックのみになること

### 🟢 Green
- [ ] 上記4関数を最小限で実装する

### 🔵 Refactor
- [ ] 日付ユーティリティの重複・可読性を整理する

---

## 3. ママの給付金計算

入力は `{ mode: 'mama', monthlySalary, dueDate, leaveEndDate }`。

### 🔴 Red
- [ ] 出産手当金のテストを書く（入力: `mode: 'mama'`, `monthlySalary`, `dueDate`）
  - `monthlySalary: 320000, dueDate: '2026-11-01'` → 98日分の金額が返ること（通常ケース）
  - `monthlySalary: 1500000, dueDate: '2026-11-01'` → 上限（日額30,887円）が適用されること、`dailyLimitReached: true` になること
- [ ] 育休前期67%のテストを書く（入力: `mode: 'mama'`, `monthlySalary`, `dueDate`, `leaveEndDate`）
  - `monthlySalary: 320000, dueDate: '2026-11-01', leaveEndDate: '2027-10-31'` → 産後57日目〜育休180日目の金額が返ること
  - `monthlySalary: 1000000, dueDate: '2026-11-01', leaveEndDate: '2027-10-31'` → 上限（日額16,110円）が適用されること
- [ ] 育休80%（+13%上乗せ）のテストを書く（入力: 同上）
  - `monthlySalary: 320000, dueDate: '2026-11-01', leaveEndDate: '2027-10-31'` → 産後57〜84日目（28日間）の `bonusAmount` が返ること
- [ ] 育休後期50%のテストを書く（入力: `mode: 'mama'`, `monthlySalary`, `dueDate`, `leaveEndDate`）
  - `monthlySalary: 320000, dueDate: '2026-11-01', leaveEndDate: '2027-10-31'` → 育休181日目以降の金額が返ること
  - `monthlySalary: 320000, dueDate: '2026-11-01', leaveEndDate: '2027-06-30'` → 育休が180日以内で後期がないこと（空になること）

### 🟢 Green
- [ ] 出産手当金（標準報酬日額 × 2/3、上限139万円）を実装する
- [ ] 育休前期67%を実装する
- [ ] 育休80%（出生後休業支援給付金 +13%上乗せ）を実装する
- [ ] 育休後期50%を実装する

### 🔵 Refactor
- [ ] ママ計算ロジックの重複・可読性を整理する

---

## 4. パパの給付金計算

入力は `{ mode: 'papa', monthlySalary, dueDate, leaveEndDate }`。

### 🔴 Red
- [ ] 出生時育児休業給付金のテストを書く（入力: `mode: 'papa'`, `monthlySalary`, `dueDate`）
  - `monthlySalary: 380000, dueDate: '2026-11-01'` → 28日分（67% + 13%）の金額が返ること
  - `monthlySalary: 380000, dueDate: '2026-11-01'`, 育休が14日のケース → 14日分の金額が返ること
  - `monthlySalary: 1000000, dueDate: '2026-11-01'` → 上限（日額16,110円）が適用されること
- [ ] 育児休業給付金のテストを書く（入力: `mode: 'papa'`, `monthlySalary`, `dueDate`, `leaveEndDate`）
  - `monthlySalary: 380000, dueDate: '2026-11-01', leaveEndDate: '2027-04-30'` → 育休29日目〜終了日が67%で返ること（180日以内）
  - `monthlySalary: 380000, dueDate: '2026-11-01', leaveEndDate: '2027-08-31'` → 育休181日目以降が50%に切り替わること（産後パパ育休28日を含む通算で判定）

### 🟢 Green
- [ ] 出生時育児休業給付金（最大28日、67% + 13%）を実装する
- [ ] 育児休業給付金（産後パパ育休の日数を通算して180日まで67%、以降50%）を実装する

### 🔵 Refactor
- [ ] パパ計算ロジックの重複・可読性を整理する

---

## 5. 共通処理（上限チェック・出力データ生成）

### 🔴 Red
- [ ] 上限チェックのテストを書く（入力: `monthlySalary`）
  - 雇用保険: `monthlySalary: 300000` → `dailyLimitReached: false`
  - 雇用保険: `monthlySalary: 1000000` → `dailyLimitReached: true`（日額16,110円上限適用）
  - 健保: `monthlySalary: 500000` → `dailyLimitReached: false`
  - 健保: `monthlySalary: 1500000` → `dailyLimitReached: true`（標準報酬月額139万円上限適用）
- [ ] `BreakdownBarSegment[]` 生成のテストを書く（入力: `mode`, `dueDate`, `leaveEndDate`）
  - `mode: 'mama', dueDate: '2026-11-01', leaveEndDate: '2027-10-31'` → 産休・育休67%・育休50%の3区分が返ること
  - `mode: 'papa', dueDate: '2026-11-01', leaveEndDate: '2027-04-30'` → 産後パパ育休・育休67%の2区分が返ること
- [ ] `PaymentSchedule[]` 生成のテストを書く（入力: `dueDate`, `leaveEndDate`）
  - `dueDate: '2026-11-01', leaveEndDate: '2027-10-31'` → 各ブロックの `estimatedPaymentMonth` が「終了月 + 2ヶ月・中旬ごろ」になること
  - 最後のブロックの `isFinal` が `true` になること
- [ ] `summaryLabel` 生成のテストを書く（入力: `mode`）
  - `mode: 'mama'` → `'出産手当金 + 育児休業給付金の合計'`
  - `mode: 'papa'` → `'出生時育児休業給付金 + 育児休業給付金の合計'`

### 🟢 Green
- [ ] 上限チェックと `dailyLimitReached` フラグのセットを実装する
- [ ] `BreakdownBarSegment[]` 生成を実装する
- [ ] `PaymentSchedule[]` 生成を実装する
- [ ] `summaryLabel` 生成を実装する

### 🔵 Refactor
- [ ] 共通処理の重複・可読性を整理する

---

## 6. コンポーネント

### ModeToggle.tsx
#### 🔴 Red
- [ ] ママ/パパ切替でコールバックが呼ばれるテストを書く
#### 🟢 Green
- [ ] ModeToggle を実装する（選択中タブのスタイル切替）
#### 🔵 Refactor
- [ ] アクセシビリティ（aria属性）を整理する

### InputForm.tsx
#### 🔴 Red
- [ ] 月給・出産予定日・育休終了予定日を入力して送信すると `CalculatorInput` が返るテストを書く
- [ ] `mode: 'papa'` 時に出産予定日ラベルが「配偶者の出産予定日」になるテストを書く
#### 🟢 Green
- [ ] InputForm を実装する
#### 🔵 Refactor
- [ ] バリデーションメッセージ・UXを整理する

### ResultSummary.tsx
#### 🔴 Red
- [ ] 合計金額・summaryLabel・内訳バーが描画されるテストを書く
#### 🟢 Green
- [ ] ResultSummary を実装する（合計金額・内訳バー）
#### 🔵 Refactor
- [ ] 内訳バーの割合計算・スタイルを整理する

### BenefitCard.tsx
#### 🔴 Red
- [ ] 給付金名・財源・期間・金額・給付率が描画されるテストを書く
- [ ] `bonusAmount` がある場合に基本額と上乗せ額の内訳が表示されるテストを書く
- [ ] `dailyLimitReached: true` で「上限適用」、`false` で「未到達」が表示されるテストを書く
- [ ] パパモードの出産手当金に「対象外」バナーが表示されるテストを書く
#### 🟢 Green
- [ ] BenefitCard を実装する
#### 🔵 Refactor
- [ ] カードのレイアウト・スタイルを整理する

### PaymentSchedule.tsx
#### 🔴 Red
- [ ] 振込スケジュール一覧が描画されるテストを書く
- [ ] `isFinal: true` の行に「最終振込」バッジが表示されるテストを書く
#### 🟢 Green
- [ ] PaymentSchedule を実装する
#### 🔵 Refactor
- [ ] レイアウト・スタイルを整理する

---

## 7. ページ組み込み（app/page.tsx）

- [ ] ModeToggle / InputForm / 結果エリアを縦並びで配置する
- [ ] モード切替・計算実行の状態管理を実装する
- [ ] 計算前は結果エリアを非表示にする

---

## 8. 総合確認

- [ ] スマホ表示（375px）で全セクションを目視確認する
- [ ] 上限到達ケースを確認する（月給483,300円超）
- [ ] 育休期間が極端に短いケースを確認する（28日未満）
- [ ] パパの育休合計が180日超のケースを確認する（50%期間が発生するか）
