# タスク: サイトのハブ化

> TDDで進める。各機能ごとに 🔴 Red → 🟢 Green → 🔵 Refactor のサイクルを完結させる。

## ステータス: 完了（PR #17）

- [x] Task 1: 計算機を /ikukyu に移動
  - [x] `app/ikukyu/` フォルダを作成し、`app/page.tsx` を `app/ikukyu/page.tsx` として移動
  - [x] `app/ikukyu/layout.tsx` で `/ikukyu` 専用メタ情報を追加

- [x] Task 2: ハブトップページを新規作成
  - [x] サイト名を「ikukyu」に決定
  - [x] 新しい `app/page.tsx` にハブページを実装（ツールカード形式）
  - [x] `/` 専用の `export const metadata` を追加
  - [x] `app/layout.tsx` のグローバル metadata をハブ用に更新

- [x] Task 3: 内部リンクの更新
  - [x] `app/components/Footer.tsx`: 著作権表記を「ikukyu」に変更
  - [x] `app/legal/page.tsx`: `← シミュレーターへ` のリンクを `/ikukyu` に変更

- [x] Task 4: 動作確認
  - [x] 全テスト通過（61件）
  - [x] ビルド成功・ルート `/`, `/ikukyu`, `/legal` が生成されることを確認
  - [x] Vercel デプロイ成功
