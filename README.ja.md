# 数独 (Sudoku)

> [🇨🇳 中文](README.md) · [🇺🇸 English](README.en.md)

ピュアフロントエンドの数独ゲーム。**Vue 3 + Vite** で構築、オフライン PWA 対応。

## 前提条件

- **Node.js** ≥ 18（推奨 22）— インストール後に `npm` が利用可能
- **pnpm** — 未インストールの場合は `npm install -g pnpm` を実行

## クイックスタート

```bash
pnpm install
pnpm dev
```

ブラウザで `http://localhost:5173` を開きます。

> ポート `5173` が使用中の場合は Vite が自動的に増分します。ターミナルの出力で実際のアドレスを確認してください。

> `npm` も使用可能：`npm install && npm run dev`（速度面で pnpm 推奨）

## ビルド

```bash
pnpm build
```

出力先は `dist/` ディレクトリ。任意の静的サーバーでホスティング可能。

## GitHub Pages へのデプロイ

このリポジトリをフォーク後：

**Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択。

`main` ブランチへのプッシュごとに自動でビルド・デプロイされます：

```
https://<あなたのユーザー名>.github.io/sudoku/
```

### PWA オフライン対応

GitHub Pages（HTTPS）にデプロイ後、このアプリは完全な **Progressive Web App**（PWA）として動作します：

- **Service Worker 自動登録**：初回アクセス時に全静的リソースをキャッシュ
- **オフライン動作**：2回目以降はオフラインでもプレイ可能
- **ホーム画面に追加**：iOS Safari や Android Chrome で対応
- **自動更新**：新バージョン公開時にバックグラウンドで更新

> ⚠️ ローカル開発環境（localhost や LAN IP）では、ブラウザのセキュリティ制限により Service Worker が登録されない場合があります。HTTPS 環境で正常動作します。

## 機能

- 4段階の難易度：初級 / 中級 / 上級 / エキスパート
- キーボード + マウス操作、Vim キー対応 (h/j/k/l)
- メモモード、自動計算、全候補表示
- スコアシステム（継続ボーナス・クリアボーナス）
- ランキング（ローカルストレージ）
- オートセーブ・再開
- アニメーション（バウンス、シェイク、行完成、ヒント点滅）
- サウンドエフェクト（Web Audio API 合成）
- アニメーション / サウンド / 数字枯渇通知のON/OFF切替
- ダークモード
- **多言語対応**：中文 / English / 日本語
- **内蔵ヘルプシステム**：基本ルール + 初中級/上級テクニックの図解
- モバイル対応

## 技術スタック

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker + Workbox)
- [vue-i18n](https://vue-i18n.intlify.dev/) v9（国際化）
- ピュア CSS（UI フレームワーク不使用）

### プロジェクト構成

```
src/
  main.js                     # エントリーポイント: Vue アプリ + vue-i18n 初期化
  App.vue                     # ルートコンポーネント: レイアウト、状態管理、モーダル制御
  style.css                   # グローバルスタイル
  locales/                    # ロケールファイル
    zh-CN.json                # 中国語
    en.json                   # 英語
    ja.json                   # 日本語
  components/
    GameHeader.vue            # ヘッダー: タイマー、スコア、難易度、ヘルプ/設定ボタン
    GameBoard.vue             # 9×9 盤面コア（セル描画、選択、アニメーション）
    NumberPad.vue             # 数字入力パネル
    ActionButtons.vue         # 消去 / メモ / ヒント / マークボタン
    BottomPanel.vue           # 下部: 新規ゲーム、ランキング、設定/テーマ切替
    SettingsOverlay.vue       # 設定モーダル（自動計算、サウンド、言語など）
    HelpOverlay.vue           # ヘルプモーダル（基本ルール + 6種テクニック図解）
    ConfirmOverlay.vue        # 確認モーダル
    LeaderboardOverlay.vue    # ランキングモーダル
    GameOverOverlay.vue       # ゲーム終了モーダル（勝敗 + スコア詳細）
  composables/
    useGameStore.js           # ゲーム状態管理（reactive シングルトン）
  utils/
    sudokuEngine.js           # 数独エンジン: 生成 / 解法 / 検証 / ヒント
    sound.js                  # Web Audio API 合成サウンド（依存関係ゼロ）
scripts/
  check-locales.cjs           # CI: 3言語のロケールファイルのキー構造が同一かを検証
.github/workflows/
  deploy-pages.yml            # GitHub Actions: ビルド → キャッシュ → ロケール検証 → デプロイ
```

## ブランチ一覧

| ブランチ | 説明 |
|---|---|
| `main` | Vue 3 + Vite リファクタリング版 |
| `legacy` | オリジナル版（HTML + CSS + JS、開発履歴保存用） |
