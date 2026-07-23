<template>
  <div class="app" :class="{ dark: isDarkMode }">
    <div class="container">
      <h1>数 独</h1>
      <p class="subtitle">— 逻辑 · 专注 · 挑战 —</p>
      <GameHeader />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GameHeader from './components/GameHeader.vue'

const isDarkMode = ref(false)
</script>

<style scoped>
.app {
  /* ---------- 浅色主题变量 ---------- */
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-text-light: #94a3b8;
  --color-surface: rgba(255, 255, 255, 0.94);
  --color-badge-bg: #f1f4f8;
  --color-badge-text: #6d7584;
  --color-diff-btn-border: #e2e8f0;
  --color-diff-btn-text: #64748b;
  --color-diff-btn-hover-border: #a5b4fc;
  --color-diff-btn-hover-text: #6366f1;
  --color-diff-btn-active-bg: #f1f4f8;
  --color-diff-btn-active-border: #cbd5e1;
  --color-diff-btn-active-text: #4f46e5;
  --color-zoom-bg: #d1d5db;
  --color-zoom-thumb: #6d7584;
  --container-shadow: 0 25px 80px rgba(0,0,0,.35), 0 4px 16px rgba(0,0,0,.15);

  /* 深色主题变量 */
  --color-text-dark: #e2e8f0;
  --color-text-muted-dark: #94a3b8;
  --color-text-light-dark: #64748b;
  --color-surface-dark: rgba(15, 23, 42, 0.94);
  --color-badge-bg-dark: #1e293b;
  --color-badge-text-dark: #94a3b8;
  --color-diff-btn-border-dark: #334155;
  --color-diff-btn-text-dark: #64748b;
  --color-diff-btn-hover-border-dark: #6366f1;
  --color-diff-btn-hover-text-dark: #e2e8f0;
  --color-diff-btn-active-bg-dark: #6366f1;
  --color-diff-btn-active-border-dark: #6366f1;
  --color-diff-btn-active-text-dark: #fff;
  --color-zoom-bg-dark: #334155;
  --color-zoom-thumb-dark: #6366f1;
  --container-shadow-dark: 0 25px 80px rgba(0,0,0,.4), 0 4px 16px rgba(0,0,0,.25);
}

.app {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.app.dark {
  --color-text: var(--color-text-dark);
  --color-text-muted: var(--color-text-muted-dark);
  --color-text-light: var(--color-text-light-dark);
  --color-surface: var(--color-surface-dark);
  --color-badge-bg: var(--color-badge-bg-dark);
  --color-badge-text: var(--color-badge-text-dark);
  --color-diff-btn-border: var(--color-diff-btn-border-dark);
  --color-diff-btn-text: var(--color-diff-btn-text-dark);
  --color-diff-btn-hover-border: var(--color-diff-btn-hover-border-dark);
  --color-diff-btn-hover-text: var(--color-diff-btn-hover-text-dark);
  --color-diff-btn-active-bg: var(--color-diff-btn-active-bg-dark);
  --color-diff-btn-active-border: var(--color-diff-btn-active-border-dark);
  --color-diff-btn-active-text: var(--color-diff-btn-active-text-dark);
  --color-zoom-bg: var(--color-zoom-bg-dark);
  --color-zoom-thumb: var(--color-zoom-thumb-dark);
  --container-shadow: var(--container-shadow-dark);
}

.container {
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 24px 28px 28px;
  box-shadow: var(--container-shadow);
  border: 1px solid rgba(255,255,255,.08);
  text-align: center;
}

h1 {
  color: var(--color-text);
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: 5px;
  margin-bottom: 1px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--color-text-light);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
</style>
