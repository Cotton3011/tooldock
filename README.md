# ToolDock

ブラウザ内で完結する、日本語の無料Webツール集です。初期版として、文字数カウンター、JSON整形、UUID生成、画像リサイズ、ルーレットを収録しています。

## 技術構成

- **Astro 5 + TypeScript**: 各ページを静的HTMLとして生成でき、SEOと表示速度に向いています。
- **React Islands**: 操作が必要なツール本体だけをReactで動かし、ページ全体のJavaScript量を抑えます。
- **Vitest**: ブラウザ処理から分離した集計・乱数ロジックを高速にテストします。
- **Cloudflare Pages**: `dist` ディレクトリをそのまま静的配信できます。サーバーやデータベースは不要です。

サイトURLは公開前に `astro.config.mjs` と `public/robots.txt` の `https://example.com` を実際のドメインへ変更してください。canonicalとsitemapに反映されます。

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

## Cloudflare Pagesへの公開

1. Cloudflare Dashboardで **Workers & Pages** を開き、**Create application** → **Pages** → **Connect to Git** を選びます。
2. GitHubアカウントを接続し、このリポジトリを選びます。
3. Framework presetは **Astro**、Build commandは `pnpm build`、Build output directoryは `dist` にします。
4. 保存してデプロイします。
5. 独自ドメインを使う場合はPagesプロジェクトの **Custom domains** から追加します。
6. 公開URL確定後、前述の `example.com` を置き換えて再度pushします。

サーバー処理はないため、Cloudflare Workersや環境変数の設定は現時点では不要です。

## 構成

```text
src/
  components/       共通UIと5ツールのReactコンポーネント
  data/tools.json   ツール情報の一元管理
  layouts/          共通レイアウトとSEO
  lib/              集計、乱数、Analyticsスタブ、型
  pages/            トップ、ツール詳細、sitemap
  styles/           共通デザイン
public/             robots.txtなどの静的ファイル
```

新しいツールの追加方法は [TOOL_CREATION_GUIDE.md](./TOOL_CREATION_GUIDE.md) を参照してください。Codexへ依頼する場合は [TOOL_TEMPLATE.md](./TOOL_TEMPLATE.md) をコピーして使えます。

## プライバシーとAnalytics

すべての入力処理はブラウザ内で完結します。`src/lib/analytics.ts` に `trackToolUse`、`trackCopy`、`trackDownload` のスタブがあり、将来ここへGoogle Analytics等の送信処理を追加できます。広告も `src/components/AdSlot.astro` の1か所を変更すれば全ページへ反映できます。
