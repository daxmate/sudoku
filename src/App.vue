<template>
  <div class="app" :class="{ dark: isDarkMode }">
    <div class="container">
      <h1>数 独</h1>
      <p class="subtitle">— 逻辑 · 专注 · 挑战 —</p>
      <GameHeader
        :difficulty="game.state.difficulty"
        :mistakes="game.state.mistakes"
        :elapsed-seconds="game.state.elapsedSeconds"
        :paused="game.state.isPaused"
        @select-difficulty="game.newGame($event)"
        @toggle-pause="game.togglePause()"
      />
      <div class="board-row">
        <GameBoard />
        <div class="side-panel">
          <ActionButtons
            :note-active="game.state.isNoteMode"
            :auto-calc-enabled="game.state.isAutoCalc"
            :hints-remaining="game.state.hintsRemaining"
            @erase="game.eraseCell()"
            @toggle-notes="game.toggleNoteMode()"
            @auto-calc="game.autoCalcCell()"
            @hint="game.useHint()"
          />
          <NumberPad @place="game.placeNumber($event)" />
          <BottomPanel
            :auto-mark-enabled="game.state.autoMarkFeature"
            @open-settings="showSettings = true"
            @new-game="showConfirm = true"
            @open-leaderboard="showLeaderboard = true"
            @toggle-theme="toggleDarkMode"
            @toggle-auto-mark="game.toggleAutoMark()"
          />
        </div>
      </div>

    <SettingsOverlay
      :visible="showSettings"
      :auto-calc="game.state.isAutoCalc"
      :auto-mark="game.state.autoMarkFeature"
      @close="showSettings = false"
      @toggle-auto-calc="game.toggleAutoCalc($event)"
      @toggle-auto-mark="game.setAutoMarkFeature($event)"
    />
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

      <Transition name="hint-toast">
        <div v-if="game.state.hintMessage" class="hint-toast">
          {{ game.state.hintMessage }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from './composables/useGameStore.js'
import SettingsOverlay from './components/SettingsOverlay.vue'
import ConfirmOverlay from './components/ConfirmOverlay.vue'
import LeaderboardOverlay from './components/LeaderboardOverlay.vue'
import GameHeader from './components/GameHeader.vue'
import GameBoard from './components/GameBoard.vue'
import ActionButtons from './components/ActionButtons.vue'
import NumberPad from './components/NumberPad.vue'
import BottomPanel from './components/BottomPanel.vue'

const game = useGameStore()

const isDarkMode = ref(false)

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}

const showSettings = ref(false)
const showConfirm = ref(false)
const showLeaderboard = ref(false)

function startNewGame() {
  game.newGame()
  showConfirm.value = false
}

onMounted(() => {
  game.newGame('medium')
  game.startTimer()
})
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
  --cell-user: #2563eb;
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
  --action-hover-bg: #f5f3ff;
  --action-hover-text: #6d28d9;
  --action-erase-text: #b91c1c;
  --action-notes-active-text: #6366f1;
  --action-warning-text: #92400e;

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

}

/* 应用浅色变量 */
.app {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* 深色变量覆盖（直接写值，不用中间变量） */
.app.dark {
  --color-text: #e2e8f0;
  --color-text-muted: #94a3b8;
  --color-text-light: #64748b;
  --color-surface: rgba(15, 23, 42, 0.94);
  --badge-bg: #1e293b;
  --badge-text: #94a3b8;
  --diff-btn-border: #334155;
  --diff-btn-text: #64748b;
  --diff-btn-hover-border: #6366f1;
  --diff-btn-hover-text: #e2e8f0;
  --diff-btn-active-bg: #6366f1;
  --diff-btn-active-border: #6366f1;
  --diff-btn-active-text: #fff;
  --zoom-bg: #334155;
  --zoom-thumb: #6366f1;
  --board-line: #475569;
  --cell-border: #334155;
  --board-border: #475569;
  --box-border: #64748b;
  --cell-bg: #1e293b;
  --cell-fixed: #94a3b8;
  --cell-user: #60a5fa;
  --cell-selected: #1e1b4b;
  --cell-highlight: #0f172a;
  --cell-same: #1e1b4b;
  --cell-error: #450a0a;
  --cell-error-text: #fca5a5;
  --note-text: #64748b;
  --numpad-bg: #1e293b;
  --numpad-text: #e2e8f0;
  --numpad-hover-bg: #334155;
  --numpad-hover-text: #e2e8f0;
  --action-bg: #1e293b;
  --action-text: #94a3b8;
  --action-hover-bg: #334155;
  --action-hover-text: #e2e8f0;
  --action-erase-text: #b85c5c;
  --action-erase-hover-bg: #450a0a;
  --action-erase-hover-text: #fca5a5;
  --action-notes-active-bg: transparent;
  --action-notes-active-text: #818cf8;
  --action-warning-text: #f59e0b;
  --action-warning-hover-bg: #451a03;
  --action-warning-hover-text: #fbbf24;
  --action-mark-hover-bg: #2e1065;
  --action-mark-hover-text: #c4b5fd;
  --hint-count-bg: #6366f1;
  --hint-count-text: #fff;
  --panel-bg: #1e293b;
  --panel-text: #94a3b8;
  --panel-hover-bg: #334155;
  --panel-hover-text: #e2e8f0;
  --panel-mark-hover-text: #6ee7b7;
  --overlay-bg: #1e293b;
  --overlay-heading: #e2e8f0;
  --overlay-label: #cbd5e1;
  --overlay-btn-bg: #334155;
  --overlay-btn-text: #94a3b8;
  --overlay-btn-hover-bg: #475569;
  --overlay-cancel-bg: #334155;
  --overlay-cancel-text: #94a3b8;
  --overlay-cancel-hover-bg: #475569;
  --overlay-cancel-hover-text: #e2e8f0;
  --lb-header-border: #334155;
  --lb-close-text: #64748b;
  --lb-close-hover-bg: #475569;
  --lb-close-hover-text: #e2e8f0;
  --lb-filter-bg: #1e293b;
  --lb-filter-text: #64748b;
  --lb-filter-active-bg: #6366f1;
  --lb-filter-active-text: #fff;
  --lb-filter-hover-bg: #334155;
  --lb-filter-hover-text: #94a3b8;
  --lb-stat-bg: #0f172a;
  --lb-stat-value: #e2e8f0;
  --lb-stat-best: #f59e0b;
  --lb-stat-label: #64748b;
  --lb-empty-text: #475569;
  --lb-entry-border: #1e293b;
  --lb-rank-text: #475569;
  --lb-rank-gold: #f59e0b;
  --lb-rank-silver: #94a3b8;
  --lb-rank-bronze: #d97706;
  --lb-score-text: #cbd5e1;
  --lb-score-gold: #f59e0b;
  --lb-meta-text: #64748b;
  --lb-diff-bg: #1e293b;
  --lb-diff-text: #94a3b8;
  --lb-time-text: #64748b;
  --toggle-bg: #475569;
  --toggle-knob: #94a3b8;
  --toggle-active: #6366f1;
  --board-shadow: 0 8px 32px rgba(0,0,0,.4);
  --container-shadow: 0 25px 80px rgba(0,0,0,.4), 0 4px 16px rgba(0,0,0,.25);
}

.container {
  position: relative;
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 24px 28px 78px;
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

/* 提示消息 Toast */
.hint-toast {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--badge-bg);
  color: var(--badge-text);
  padding: 10px 24px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
  white-space: nowrap;
}

.hint-toast-enter-active { transition: all .3s ease-out; }
.hint-toast-leave-active { transition: all .3s ease-in; }
.hint-toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
.hint-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-16px);
}
</style>
