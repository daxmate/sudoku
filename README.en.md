# Sudoku

> [🇨🇳 中文](README.md) · [🇯🇵 日本語](README.ja.md)

A pure front-end Sudoku game built with **Vue 3 + Vite**, featuring offline PWA support.

## Prerequisites

- **Node.js** ≥ 18 (recommended 22) — includes `npm`
- **pnpm** — install with `npm install -g pnpm` if not available

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173` in your browser.

> If port `5173` is in use, Vite will auto-increment. Check the terminal output for the actual address.

> You can also use `npm`: `npm install && npm run dev` (pnpm recommended for speed).

## Build

```bash
pnpm build
```

Output goes to `dist/`, which can be served by any static file server.

## Deploy to GitHub Pages

After forking this repo, follow these steps:

In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.

Every push to the `main` branch will automatically build and deploy to:

```
https://<your-username>.github.io/sudoku/
```

### PWA Offline Support

Deployed to GitHub Pages (HTTPS), this app is a fully functional **Progressive Web App** (PWA):

- **Service Worker auto-registration**: caches all static assets on first visit
- **Works offline**: from the second visit onward, works without internet
- **Add to Home Screen**: supported on iOS Safari and Android Chrome
- **Auto-update**: new versions are fetched in the background

> ⚠️ During local development (localhost or LAN IP), Service Worker may not register due to browser security restrictions. It works normally on HTTPS.

## Features

- Four difficulty levels: Easy / Medium / Hard / Expert
- Keyboard + mouse controls, Vim keys support (h/j/k/l)
- Notes mode, auto-calculation, auto-candidate marking
- Scoring system (with consecutive play & completion bonuses)
- Leaderboard (local storage)
- Auto-save / resume
- Animations (bounce, shake, row completion, hint flash)
- Sound effects (Web Audio API synthesized)
- Animation / sound / depletion alerts can be toggled
- Dark mode
- **Multi-language**: 中文 / English / 日本語
- **Built-in help system**: basic rules + beginner/intermediate/advanced techniques with diagrams
- Mobile responsive

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker + Workbox)
- [vue-i18n](https://vue-i18n.intlify.dev/) v9 (internationalization)
- Pure CSS (no UI framework)

### Project Structure

```
src/
  main.js                     # Entry point: Vue app + vue-i18n initialization
  App.vue                     # Root component: layout, state, modal dispatch
  style.css                   # Global styles
  locales/                    # Locale resource files
    zh-CN.json                # Chinese
    en.json                   # English
    ja.json                   # Japanese
  components/
    GameHeader.vue            # Header: timer, score, difficulty, help/settings buttons
    GameBoard.vue             # 9×9 board core (cell rendering, selection, animation)
    NumberPad.vue             # Number input panel
    ActionButtons.vue         # Erase / Notes / Hint / Mark buttons
    BottomPanel.vue           # Bottom: new game, leaderboard, settings/theme toggle
    SettingsOverlay.vue       # Settings modal (auto-calc, sound, language, etc.)
    HelpOverlay.vue           # Help modal (basic rules + 6 techniques with diagrams)
    ConfirmOverlay.vue        # Confirmation modal
    LeaderboardOverlay.vue    # Leaderboard modal
    GameOverOverlay.vue       # Game over modal (win/lose + score breakdown)
  composables/
    useGameStore.js           # Game state management (reactive singleton)
  utils/
    sudokuEngine.js           # Sudoku engine: generate / solve / validate / hint
    sound.js                  # Web Audio API synthesized sounds (zero dependencies)
scripts/
  check-locales.cjs           # CI script to verify all locale files have identical key structure
.github/workflows/
  deploy-pages.yml            # GitHub Actions: build → cache → locale check → deploy
```

## Branch Guide

| Branch | Description |
|---|---|
| `main` | Vue 3 + Vite refactored version |
| `legacy` | Original HTML + CSS + JS version (preserved for history) |
