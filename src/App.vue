<template>
  <div class="app" :class="{ dark: isDarkMode }">
    <div class="container">
      <h1>数 独</h1>
      <p class="subtitle">— 逻辑 · 专注 · 挑战 —</p>
      <GameHeader />
      <div class="board-row">
        <GameBoard />
        <div class="side-panel">
          <ActionButtons />
          <NumberPad />
          <BottomPanel @open-settings="showSettings = true" @new-game="showConfirm = true" @open-leaderboard="showLeaderboard = true" @toggle-theme="toggleDarkMode" />
        </div>
      </div>

    <SettingsOverlay :visible="showSettings" @close="showSettings = false" />
    <ConfirmOverlay
      :visible="showConfirm"
      message="确定要开始新游戏吗？当前进度将丢失。"
      @confirm="startNewGame"
      @cancel="showConfirm = false"
    />
    <LeaderboardOverlay
      :visible="showLeaderboard"
      @close="showLeaderboard = false"
    />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SettingsOverlay from './components/SettingsOverlay.vue'
import ConfirmOverlay from './components/ConfirmOverlay.vue'
import LeaderboardOverlay from './components/LeaderboardOverlay.vue'
import GameHeader from './components/GameHeader.vue'
import GameBoard from './components/GameBoard.vue'
import ActionButtons from './components/ActionButtons.vue'
import NumberPad from './components/NumberPad.vue'
import BottomPanel from './components/BottomPanel.vue'

const isDarkMode = ref(false)

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}

const showSettings = ref(false)
const showConfirm = ref(false)
const showLeaderboard = ref(false)

function startNewGame() {
  showConfirm.value = false
}
</script>

<style scoped>
.app {
  /* ==================== 浅色主题 ==================== */
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-text-light: #94a3b8;
  --color-surface: rgba(255, 255, 255, 0.94);

  /* GameHeader - 状态标签 */
  --badge-bg: #f1f4f8;
  --badge-text: #6d7584;

  /* GameHeader - 难度按钮 */
  --diff-btn-border: #e2e8f0;
  --diff-btn-text: #64748b;
  --diff-btn-hover-border: #a5b4fc;
  --diff-btn-hover-text: #6366f1;
  --diff-btn-active-bg: #f1f4f8;
  --diff-btn-active-border: #cbd5e1;
  --diff-btn-active-text: #4f46e5;

  /* GameHeader - 缩放条 */
  --zoom-bg: #d1d5db;
  --zoom-thumb: #6d7584;

  /* GameBoard */
  --board-line: #d1d5db;
  --cell-border: #cbd5e1;

  /* BoardCell */
  --board-border: #334155;
  --box-border: #888;
  --cell-bg: #fff;
  --cell-fixed: #334155;
  --cell-selected: #eef2ff;
  --cell-highlight: #f1f5f9;
  --cell-same: #dbeafe;
  --cell-error: #fef2f2;
  --cell-error-text: #dc2626;
  --note-text: #94a3b8;

  /* NumberPad */
  --numpad-bg: #f1f4f8;
  --numpad-text: #6d7584;
  --numpad-hover-bg: #e5e9f0;
  --numpad-hover-text: #4f46e5;

  /* ActionButtons */
  --action-bg: #f1f4f8;
  --action-text: #6d7584;
  --action-hover-bg: #e5e9f0;
  --action-hover-text: #4f46e5;
  --action-erase-text: #b91c1c;
  --action-erase-hover-bg: #fef2f2;
  --action-erase-hover-text: #dc2626;
  --action-notes-active-bg: #eef2ff;
  --action-notes-active-text: #4f46e5;
  --action-warning-text: #92400e;
  --action-warning-hover-bg: #fef3c7;
  --action-warning-hover-text: #d97706;
  --action-mark-hover-bg: #f5f3ff;
  --action-mark-hover-text: #6d28d9;
  --hint-count-bg: #94a3b8;
  --hint-count-text: #fff;

  /* BottomPanel */
  --panel-bg: #f1f4f8;
  --panel-text: #6d7584;
  --panel-hover-bg: #e5e9f0;
  --panel-hover-text: #4f46e5;
  --panel-mark-hover-text: #065f46;

  /* Overlays */
  --overlay-bg: #fff;
  --overlay-heading: #334155;
  --overlay-label: #475569;
  --overlay-btn-bg: #f1f4f8;
  --overlay-btn-text: #4f46e5;
  --overlay-btn-hover-bg: #e5e9f0;
  --overlay-cancel-bg: #f1f4f8;
  --overlay-cancel-text: #6d7584;
  --overlay-cancel-hover-bg: #e5e9f0;
  --overlay-cancel-hover-text: #dc2626;

  /* LeaderboardOverlay */
  --lb-header-border: #e2e8f0;
  --lb-close-text: #94a3b8;
  --lb-close-hover-bg: #f1f4f8;
  --lb-close-hover-text: #475569;
  --lb-filter-bg: #f1f4f8;
  --lb-filter-text: #64748b;
  --lb-filter-active-bg: #4f46e5;
  --lb-filter-active-text: #fff;
  --lb-filter-hover-bg: #e5e9f0;
  --lb-filter-hover-text: #475569;
  --lb-stat-bg: #f8fafc;
  --lb-stat-value: #1e293b;
  --lb-stat-best: #f59e0b;
  --lb-stat-label: #94a3b8;
  --lb-empty-text: #94a3b8;
  --lb-entry-border: #f1f5f9;
  --lb-rank-text: #94a3b8;
  --lb-rank-gold: #f59e0b;
  --lb-rank-silver: #94a3b8;
  --lb-rank-bronze: #d97706;
  --lb-score-text: #4f46e5;
  --lb-score-gold: #f59e0b;
  --lb-meta-text: #94a3b8;
  --lb-diff-bg: #f1f4f8;
  --lb-diff-text: #94a3b8;
  --lb-time-text: #64748b;

  /* SettingsOverlay */
  --toggle-bg: #cbd5e1;
  --toggle-knob: #fff;
  --toggle-active: #6366f1;

  /* Shadows */
  --board-shadow: 0 8px 32px rgba(0,0,0,.1);
  --container-shadow: 0 25px 80px rgba(0,0,0,.35), 0 4px 16px rgba(0,0,0,.15);

  /* ==================== 深色主题 ==================== */
  --color-text-dark: #e2e8f0;
  --color-text-muted-dark: #94a3b8;
  --color-text-light-dark: #64748b;
  --color-surface-dark: rgba(15, 23, 42, 0.94);
  --badge-bg-dark: #1e293b;
  --badge-text-dark: #94a3b8;
  --diff-btn-border-dark: #334155;
  --diff-btn-text-dark: #64748b;
  --diff-btn-hover-border-dark: #6366f1;
  --diff-btn-hover-text-dark: #e2e8f0;
  --diff-btn-active-bg-dark: #6366f1;
  --diff-btn-active-border-dark: #6366f1;
  --diff-btn-active-text-dark: #fff;
  --zoom-bg-dark: #334155;
  --zoom-thumb-dark: #6366f1;
  --board-line-dark: #475569;
  --cell-border-dark: #334155;
  --board-border-dark: #475569;
  --box-border-dark: #64748b;
  --cell-bg-dark: #1e293b;
  --cell-fixed-dark: #94a3b8;
  --cell-selected-dark: #1e1b4b;
  --cell-highlight-dark: #0f172a;
  --cell-same-dark: #1e1b4b;
  --cell-error-dark: #450a0a;
  --cell-error-text-dark: #fca5a5;
  --note-text-dark: #64748b;
  --numpad-bg-dark: #1e293b;
  --numpad-text-dark: #e2e8f0;
  --numpad-hover-bg-dark: #334155;
  --numpad-hover-text-dark: #e2e8f0;
  --action-bg-dark: #1e293b;
  --action-text-dark: #94a3b8;
  --action-hover-bg-dark: #334155;
  --action-hover-text-dark: #e2e8f0;
  --action-erase-text-dark: #b85c5c;
  --action-erase-hover-bg-dark: #450a0a;
  --action-erase-hover-text-dark: #fca5a5;
  --action-notes-active-bg-dark: #312e81;
  --action-notes-active-text-dark: #a5b4fc;
  --action-warning-text-dark: #f59e0b;
  --action-warning-hover-bg-dark: #451a03;
  --action-warning-hover-text-dark: #fbbf24;
  --action-mark-hover-bg-dark: #2e1065;
  --action-mark-hover-text-dark: #c4b5fd;
  --hint-count-bg-dark: #6366f1;
  --hint-count-text-dark: #fff;
  --panel-bg-dark: #1e293b;
  --panel-text-dark: #94a3b8;
  --panel-hover-bg-dark: #334155;
  --panel-hover-text-dark: #e2e8f0;
  --panel-mark-hover-text-dark: #6ee7b7;
  --overlay-bg-dark: #1e293b;
  --overlay-heading-dark: #e2e8f0;
  --overlay-label-dark: #cbd5e1;
  --overlay-btn-bg-dark: #334155;
  --overlay-btn-text-dark: #94a3b8;
  --overlay-btn-hover-bg-dark: #475569;
  --overlay-cancel-bg-dark: #334155;
  --overlay-cancel-text-dark: #94a3b8;
  --overlay-cancel-hover-bg-dark: #475569;
  --overlay-cancel-hover-text-dark: #e2e8f0;
  --lb-header-border-dark: #334155;
  --lb-close-text-dark: #64748b;
  --lb-close-hover-bg-dark: #475569;
  --lb-close-hover-text-dark: #e2e8f0;
  --lb-filter-bg-dark: #1e293b;
  --lb-filter-text-dark: #64748b;
  --lb-filter-active-bg-dark: #6366f1;
  --lb-filter-active-text-dark: #fff;
  --lb-filter-hover-bg-dark: #334155;
  --lb-filter-hover-text-dark: #94a3b8;
  --lb-stat-bg-dark: #0f172a;
  --lb-stat-value-dark: #e2e8f0;
  --lb-stat-best-dark: #f59e0b;
  --lb-stat-label-dark: #64748b;
  --lb-empty-text-dark: #475569;
  --lb-entry-border-dark: #1e293b;
  --lb-rank-text-dark: #475569;
  --lb-rank-gold-dark: #f59e0b;
  --lb-rank-silver-dark: #94a3b8;
  --lb-rank-bronze-dark: #d97706;
  --lb-score-text-dark: #cbd5e1;
  --lb-score-gold-dark: #f59e0b;
  --lb-meta-text-dark: #64748b;
  --lb-diff-bg-dark: #1e293b;
  --lb-diff-text-dark: #94a3b8;
  --lb-time-text-dark: #64748b;
  --toggle-bg-dark: #475569;
  --toggle-knob-dark: #94a3b8;
  --toggle-active-dark: #6366f1;
  --board-shadow-dark: 0 8px 32px rgba(0,0,0,.4);
  --container-shadow-dark: 0 25px 80px rgba(0,0,0,.4), 0 4px 16px rgba(0,0,0,.25);
}

/* 应用浅色变量 */
.app {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* 深色变量覆盖 */
.app.dark {
  --color-text: var(--color-text-dark);
  --color-text-muted: var(--color-text-muted-dark);
  --color-text-light: var(--color-text-light-dark);
  --color-surface: var(--color-surface-dark);
  --badge-bg: var(--badge-bg-dark);
  --badge-text: var(--badge-text-dark);
  --diff-btn-border: var(--diff-btn-border-dark);
  --diff-btn-text: var(--diff-btn-text-dark);
  --diff-btn-hover-border: var(--diff-btn-hover-border-dark);
  --diff-btn-hover-text: var(--diff-btn-hover-text-dark);
  --diff-btn-active-bg: var(--diff-btn-active-bg-dark);
  --diff-btn-active-border: var(--diff-btn-active-border-dark);
  --diff-btn-active-text: var(--diff-btn-active-text-dark);
  --zoom-bg: var(--zoom-bg-dark);
  --zoom-thumb: var(--zoom-thumb-dark);
  --board-line: var(--board-line-dark);
  --cell-border: var(--cell-border-dark);
  --board-border: var(--board-border-dark);
  --box-border: var(--box-border-dark);
  --cell-bg: var(--cell-bg-dark);
  --cell-fixed: var(--cell-fixed-dark);
  --cell-selected: var(--cell-selected-dark);
  --cell-highlight: var(--cell-highlight-dark);
  --cell-same: var(--cell-same-dark);
  --cell-error: var(--cell-error-dark);
  --cell-error-text: var(--cell-error-text-dark);
  --note-text: var(--note-text-dark);
  --numpad-bg: var(--numpad-bg-dark);
  --numpad-text: var(--numpad-text-dark);
  --numpad-hover-bg: var(--numpad-hover-bg-dark);
  --numpad-hover-text: var(--numpad-hover-text-dark);
  --action-bg: var(--action-bg-dark);
  --action-text: var(--action-text-dark);
  --action-hover-bg: var(--action-hover-bg-dark);
  --action-hover-text: var(--action-hover-text-dark);
  --action-erase-text: var(--action-erase-text-dark);
  --action-erase-hover-bg: var(--action-erase-hover-bg-dark);
  --action-erase-hover-text: var(--action-erase-hover-text-dark);
  --action-notes-active-bg: var(--action-notes-active-bg-dark);
  --action-notes-active-text: var(--action-notes-active-text-dark);
  --action-warning-text: var(--action-warning-text-dark);
  --action-warning-hover-bg: var(--action-warning-hover-bg-dark);
  --action-warning-hover-text: var(--action-warning-hover-text-dark);
  --action-mark-hover-bg: var(--action-mark-hover-bg-dark);
  --action-mark-hover-text: var(--action-mark-hover-text-dark);
  --hint-count-bg: var(--hint-count-bg-dark);
  --hint-count-text: var(--hint-count-text-dark);
  --panel-bg: var(--panel-bg-dark);
  --panel-text: var(--panel-text-dark);
  --panel-hover-bg: var(--panel-hover-bg-dark);
  --panel-hover-text: var(--panel-hover-text-dark);
  --panel-mark-hover-text: var(--panel-mark-hover-text-dark);
  --overlay-bg: var(--overlay-bg-dark);
  --overlay-heading: var(--overlay-heading-dark);
  --overlay-label: var(--overlay-label-dark);
  --overlay-btn-bg: var(--overlay-btn-bg-dark);
  --overlay-btn-text: var(--overlay-btn-text-dark);
  --overlay-btn-hover-bg: var(--overlay-btn-hover-bg-dark);
  --overlay-cancel-bg: var(--overlay-cancel-bg-dark);
  --overlay-cancel-text: var(--overlay-cancel-text-dark);
  --overlay-cancel-hover-bg: var(--overlay-cancel-hover-bg-dark);
  --overlay-cancel-hover-text: var(--overlay-cancel-hover-text-dark);
  --lb-header-border: var(--lb-header-border-dark);
  --lb-close-text: var(--lb-close-text-dark);
  --lb-close-hover-bg: var(--lb-close-hover-bg-dark);
  --lb-close-hover-text: var(--lb-close-hover-text-dark);
  --lb-filter-bg: var(--lb-filter-bg-dark);
  --lb-filter-text: var(--lb-filter-text-dark);
  --lb-filter-active-bg: var(--lb-filter-active-bg-dark);
  --lb-filter-active-text: var(--lb-filter-active-text-dark);
  --lb-filter-hover-bg: var(--lb-filter-hover-bg-dark);
  --lb-filter-hover-text: var(--lb-filter-hover-text-dark);
  --lb-stat-bg: var(--lb-stat-bg-dark);
  --lb-stat-value: var(--lb-stat-value-dark);
  --lb-stat-best: var(--lb-stat-best-dark);
  --lb-stat-label: var(--lb-stat-label-dark);
  --lb-empty-text: var(--lb-empty-text-dark);
  --lb-entry-border: var(--lb-entry-border-dark);
  --lb-rank-text: var(--lb-rank-text-dark);
  --lb-rank-gold: var(--lb-rank-gold-dark);
  --lb-rank-silver: var(--lb-rank-silver-dark);
  --lb-rank-bronze: var(--lb-rank-bronze-dark);
  --lb-score-text: var(--lb-score-text-dark);
  --lb-score-gold: var(--lb-score-gold-dark);
  --lb-meta-text: var(--lb-meta-text-dark);
  --lb-diff-bg: var(--lb-diff-bg-dark);
  --lb-diff-text: var(--lb-diff-text-dark);
  --lb-time-text: var(--lb-time-text-dark);
  --toggle-bg: var(--toggle-bg-dark);
  --toggle-knob: var(--toggle-knob-dark);
  --toggle-active: var(--toggle-active-dark);
  --board-shadow: var(--board-shadow-dark);
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

.board-row {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 14px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 140px;
  max-width: 210px;
}
</style>
