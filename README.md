# 数独 (Sudoku)

纯前端数独游戏，使用 **Vue 3 + Vite** 构建，支持离线 PWA 体验。

## 快速开始

```bash
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5173` 即可。

> 如果 `5173` 被占用，Vite 会自动递增端口号，留意终端输出的地址即可。

## 构建

```bash
pnpm build
```

产物输出到 `dist/` 目录，可直接用任意静态服务器托管。

## 部署到 GitHub Pages

Fork 本仓库后，只需一步：

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

之后每次推送 `main` 分支，会自动构建部署到：

```
https://<你的用户名>.github.io/sudoku/
```

### PWA 离线支持

部署到 GitHub Pages（HTTPS）后，本应用是一个完整的 **Progressive Web App**（PWA）：

- **Service Worker 自动注册**：首次访问时自动安装并缓存所有静态资源
- **离线可用**：第二次访问开始，即使断网也能正常打开和游戏
- **添加到主屏幕**：iOS Safari 或 Android Chrome 均可添加到桌面，像原生 App 一样启动
- **自动更新**：发布新版本后，Service Worker 会在后台自动更新

> ⚠️ 本地开发时（`localhost` 或局域网 IP），Service Worker 可能无法正常注册，这是浏览器对 PWA 的安全限制。部署到 HTTPS 地址后即可正常工作。

## 功能

- 四种难度：简单 / 中等 / 困难 / 专家
- 键盘 + 鼠标操作，支持 Vim 方向键 (h/j/k/l)
- 笔记模式、自动计算、全部标记
- 积分系统（含连续奖励、通关奖励）
- 排行榜（本地存储）
- 存档续盘（自动保存）
- 动效（弹跳、抖动、行完成、提示闪烁）
- 音效（Web Audio API 合成）
- 动效 / 音效 / 数字耗尽提示 可开关
- 深色模式
- **多语言支持**：中文 / English / 日本語
- **内置帮助系统**：基本规则 + 入门/进阶/高级技巧图文说明
- 移动端适配

## 技术栈

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker + Workbox)
- [vue-i18n](https://vue-i18n.intlify.dev/) v9（多语言国际化）
- 纯 CSS（无 UI 框架）

### 项目结构

```
src/
  locales/          # 多语言资源文件
    zh-CN.json      # 中文
    en.json         # 英文
    ja.json         # 日文
  components/
    HelpOverlay.vue # 帮助系统弹窗（基本规则 + 6 种解题技巧）
  utils/
    sound.js        # Web Audio API 合成音效（零依赖）
    sudokuEngine.js # 数独引擎（生成 / 求解 / 校验）
scripts/
  check-locales.cjs # CI 中校验三个语言文件 key 结构一致
```

## 分支说明

| 分支 | 说明 |
|---|---|
| `main` | Vue 3 + Vite 重构版 |
| `legacy` | 原版 HTML + CSS + JS（保留开发历史） |
