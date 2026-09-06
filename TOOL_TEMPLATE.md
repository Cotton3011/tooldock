# Codex用・新規Webツール追加テンプレート

以下の要件で、既存のToolDockへ新しいWebツールを追加してください。既存構成・デザイン・コーディングスタイルを維持し、入力データはブラウザ内だけで処理してください。

## ツール情報

- ツールID: `{英小文字とハイフン}`
- 名前: `{日本語名}`
- 説明: `{検索結果でも内容が分かる簡潔な説明}`
- カテゴリ: `{vtuber | text | development | image | random}`
- URL: `{一般: /tools/{ツールID} | VTuber: /vtuber/{ツールID}}`
- SEOキーワード: `{自然に関連する語句}`
- 主力表示: `{popular: true | false}`

## 必要な機能

- `{機能1}`
- `{機能2}`
- `{機能3}`

## ページ内容

- 使い方: `{3段階程度}`
- 主な用途: `{3件程度}`
- FAQ: `{質問と回答を2件以上}`
- 関連ツール: `{relatedToolsに指定するID}`

## 実装条件

- `src/data/tools.json` へ情報を追加する
- ツール本体は `src/components/tools/` に作る
- 必要なら純粋な処理を `src/lib/` に分ける
- カテゴリに応じて `src/pages/tools/[id].astro` または `src/pages/vtuber/[id].astro` へ対応付けと使い方を追加する
- 共通Analyticsイベント関数を適切に呼ぶ
- 空入力、不正入力、大きな入力を考慮する
- PCとスマホで操作できるようにする
- 適切な自動テストを追加する
- `pnpm test` と `pnpm build` を実行し、成功を確認する
- sitemap、トップ、関連ツールへの反映を確認する
