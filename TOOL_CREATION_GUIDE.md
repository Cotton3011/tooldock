# 新規ツール作成ガイド

## 1. ツールIDを決める

英小文字とハイフンで一意なIDを決めます。例: `password-generator`。このIDはURLとコンポーネント対応付けに使うため、公開後は変更しません。

## 2〜5. 名前・説明・カテゴリ・URLを登録する

`src/data/tools.json` に1件追加します。カテゴリは `text`、`development`、`image`、`random` のいずれか、URLは `/tools/{id}` とします。公開準備ができるまでは `enabled: false` にできます。

## 6. ツール本体を作る

`src/components/tools/` にReactコンポーネントを作成します。入力データはブラウザ内で処理し、外部送信しません。処理ロジックは可能なら `src/lib/` に分け、テストしやすくします。操作イベントには `trackToolUse`、コピーには `trackCopy`、ダウンロードには `trackDownload` を呼び出します。

`src/pages/tools/[id].astro` の `components` にIDとコンポーネントの対応を追加し、`usage` に3段階程度の使い方を追加します。

## 7. SEO情報を確認する

titleとmeta descriptionはツールデータの名前・説明から自動生成されます。検索結果で意味が伝わる自然な名前と、具体的な説明にします。canonical、OGP、robotsは共通レイアウト、sitemapは有効なツールデータから生成されます。

## 8. 関連ツールを確認する

関連ツールは同じカテゴリを優先して自動表示します。個別指定が必要になった場合はツールデータへ関連ID配列を追加し、`ToolLayout.astro` の選択処理を拡張します。

## 9. テストする

- 通常入力で期待する結果になる
- 空入力でエラーや不自然な値が出ない
- 不正入力を分かりやすく案内する
- 大きな入力で操作不能にならない
- 320px程度のスマホ幅でも操作できる
- キーボード操作とフォーカス表示が使える
- `pnpm test` が成功する
- `pnpm build` でTypeScript・ビルドエラーが出ない

公開前にツールデータの `enabled` を `true` にし、トップ・関連ツール・sitemapへ反映されたことを確認します。
