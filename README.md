# VToolDock

ブラウザ内で完結する、日本語の無料Webツール集です。初期版として、文字数カウンター、JSON整形、UUID生成、画像リサイズ、ルーレットを収録しています。

## 技術構成

- **Astro 5 + TypeScript**: 各ページを静的HTMLとして生成でき、SEOと表示速度に向いています。
- **React Islands**: 操作が必要なツール本体だけをReactで動かし、ページ全体のJavaScript量を抑えます。
- **Vitest**: ブラウザ処理から分離した集計・乱数ロジックを高速にテストします。
- **Cloudflare Workers Static Assets + D1**: 静的ページは`dist`から直接配信し、VTuber名前検索の`/api/*`だけをWorkerで処理します。

本番サイトURLは`https://vtooldock.com`です。`astro.config.mjs`のsite、canonical、sitemap、robotsへ反映されています。

## ローカル起動

Node.js 20以降とpnpmを用意し、プロジェクト直下で実行します。

```bash
pnpm install
pnpm dev
```

表示された `http://localhost:4321` をブラウザで開きます。

## テストと本番ビルド

```bash
pnpm test
pnpm build
```

`pnpm build` はTypeScript/Astroの検査後、公開用ファイルを `dist` に生成します。ローカルで本番版を確認する場合は `pnpm preview` を実行します。

## GitHubへのpush

GitHubで空のリポジトリを作成し、表示されたURLに置き換えて実行します。

```bash
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push -u origin main
```

秘密情報は `.env` に置きます。`.gitignore` によりコミット対象から除外されます。

## Cloudflare Workersへの公開

1. `pnpm exec wrangler d1 create tooldock-vtuber`を実行し、表示されたDatabase IDを`wrangler.jsonc`の`database_id`へ設定します。
2. `pnpm exec wrangler d1 migrations apply tooldock-vtuber --remote`で本番DBへmigrationを適用します。
3. Cloudflare DashboardのTurnstileでウィジェットを作り、本番ホスト名を登録します。
4. WorkersのBuild variablesへ`PUBLIC_TURNSTILE_SITE_KEY`、Secretへ`TURNSTILE_SECRET_KEY`と十分に長いランダム値の`ABUSE_HASH_SALT`を設定します。
5. GitHub連携のBuild commandを`pnpm build`、Deploy commandを`pnpm exec wrangler deploy`にします。
6. WorkersのCustom Domainsで`vtooldock.com`を設定します。

ローカルでは`.env.example`を`.env`、`.dev.vars.example`を`.dev.vars`へコピーしてから実行します。例に含まれるTurnstileキーはCloudflare公式のテスト専用キーです。

```bash
pnpm build
pnpm db:migrate:local
pnpm dev:worker
```

秘密情報を含む`.dev.vars`はGit管理対象外です。Turnstileトークンは登録・通報のたびにWorkerからSiteverifyへ送信して検証します。

## 構成

```text
src/
  components/       共通UIと5ツールのReactコンポーネント
  data/tools.json   ツール情報の一元管理
  layouts/          共通レイアウトとSEO
  lib/              集計、入力検証、乱数、Analyticsスタブ、型
  pages/            トップ、ツール詳細、sitemap
  styles/           共通デザイン
worker/             D1・Turnstileを使う名前検索API
migrations/         D1 schema migration
public/             robots.txtなどの静的ファイル
```

新しいツールの追加方法は [TOOL_CREATION_GUIDE.md](./TOOL_CREATION_GUIDE.md) を参照してください。Codexへ依頼する場合は [TOOL_TEMPLATE.md](./TOOL_TEMPLATE.md) をコピーして使えます。

## プライバシーとAnalytics

画像・テキスト等の既存ツールはブラウザ内で完結します。VTuber名前検索の登録情報と通報情報だけをCloudflare D1へ保存します。`src/lib/analytics.ts` に `trackToolUse`、`trackCopy`、`trackDownload` のスタブがあり、将来ここへGoogle Analytics等の送信処理を追加できます。広告も `src/components/AdSlot.astro` の1か所を変更すれば全ページへ反映できます。
