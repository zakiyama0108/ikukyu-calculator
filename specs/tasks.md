# タスク（Tasks）

> TDDで進める。各機能ごとに 🔴 Red → 🟢 Green → 🔵 Refactor のサイクルを完結させてから次へ進む。

## ステータス凡例
- [ ] 未着手
- [x] 完了

---

## Phase 1: 育休給付金シミュレーター（完了）

- [x] 0. UIガワ作成
- [x] 1. 型定義
- [x] 2. 日付・期間ユーティリティ
- [x] 3. ママの給付金計算
- [x] 4. パパの給付金計算（産後パパ育休・出産予定日対応含む）
- [x] 5. 共通処理（上限チェック・出力データ生成）
- [x] 6. コンポーネント
- [x] 7. ページ組み込み（app/page.tsx）
- [x] 8. 総合確認・バグ修正

---

## Phase 2: サイトのハブ化

### Task 1: 計算機を /ikukyu に移動

- [x] `app/ikukyu/` フォルダを作成し、現在の `app/page.tsx` を `app/ikukyu/page.tsx` として移動
- [x] `app/ikukyu/layout.tsx` に `/ikukyu` 専用の `export const metadata` を追加
  - title: `育休給付金シミュレーター | ikukyu`
  - description: `産後から育休まで、もらえる給付金が全部わかる無料シミュレーターです。`
- [x] `/ikukyu` で計算機が正常動作することを確認

### Task 2: ハブトップページを新規作成

- [x] サイト名を「ikukyu」に決定
- [x] 新しい `app/page.tsx` にハブページを実装
  - サイト名・キャッチコピー
  - ツールカード（育休給付金シミュレーター → `/ikukyu`）
- [x] `app/page.tsx` に `/` 専用の `export const metadata` を追加
- [x] `app/layout.tsx` の既存 metadata をハブ用に更新

### Task 3: 内部リンクの更新

- [x] `app/components/Footer.tsx`
  - 著作権表記を「ikukyu」に更新
- [x] `app/legal/page.tsx`
  - `← シミュレーターへ` のリンクを `/` → `/ikukyu` に変更

### Task 4: 動作確認

- [x] `/` でハブページが表示されること
- [x] `/ikukyu` で計算機が正常動作すること
- [x] `/legal` の「← シミュレーターへ」が `/ikukyu` に遷移すること
- [x] Footerのリンクが正しいこと
- [x] 全テストが通ること（`npm test`）
- [x] ビルドが通ること（`npm run build`）
- [x] Vercel デプロイ成功を確認（PR #17）
