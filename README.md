# 数独 (Sudoku)

纯前端数独游戏，使用 **Vue 3 + Vite** 构建。

## 试玩

```
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5175` 即可。

## 部署到 GitHub Pages

Fork 本仓库后，只需一步：

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

之后每次推送 `main` 分支，会自动构建部署到：

```
https://<你的用户名>.github.io/sudoku/
```

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
- 移动端适配

## 技术栈

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/)
- 纯 CSS (无 UI 框架)

## 分支说明

| 分支 | 说明 |
|---|---|
| `main` | Vue 3 + Vite 重构版 |
| `legacy` | 原版 HTML + CSS + JS (保留开发历史) |
