<template>
  <div class="bottom-section">
    <div class="bottom-row">
      <button
        class="auto-mark-btn"
        :class="{ disabled: !autoMarkEnabled }"
        :title="autoMarkEnabled ? t('actions.autoMarkEnabled') : t('actions.autoMarkDisabled')"
        @click="autoMarkEnabled ? $emit('toggleAutoMark') : null"
      >
        <svg viewBox="0 0 30 30" width="24" height="24" fill="none">
          <circle cx="15" cy="16" r="8.5" stroke="currentColor" stroke-width="1.5"/>
          <rect x="13.5" y="6" width="3" height="3" rx=".6" stroke="currentColor" stroke-width="1.3"/>
          <path d="M15 6q3-2 1-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="new-game-btn" @click="$emit('newGame')">{{ t('bottom.newGame') }}</button>
    </div>
    <div class="leaderboard-row">
      <button class="lb-btn" @click="$emit('openLeaderboard')">{{ t('bottom.leaderboard') }}</button>
      <button class="icon-btn" :title="t('bottom.theme')" @click="$emit('toggleTheme')">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
          <path d="M14 8.79A6.5 6.5 0 117.21 2 5 5 0 0014 8.79z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="icon-btn" :title="t('bottom.settings')" @click="$emit('openSettings')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3.5"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  autoMarkEnabled: Boolean,
})

defineEmits(['openSettings', 'newGame', 'openLeaderboard', 'toggleTheme', 'toggleAutoMark'])
</script>

<style scoped>
.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
}

.leaderboard-row {
  margin-top: auto;
}

.bottom-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4px;
}

.auto-mark-btn {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  border-radius: 6px;
  background: var(--panel-bg);
  color: var(--panel-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
}

.auto-mark-btn:hover {
  background: var(--panel-hover-bg);
  color: var(--panel-mark-hover-text);
}

.auto-mark-btn.disabled {
  opacity: 0.45;
}

.auto-mark-btn.disabled:hover {
  background: var(--panel-bg);
  color: var(--panel-text);
  transform: none;
}

.new-game-btn {
  width: 100%;
  border: none;
  border-radius: 6px;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s ease;
  font-family: 'Inter', sans-serif;
  background: var(--panel-bg);
  color: var(--panel-text);
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
}

.new-game-btn:hover {
  background: var(--panel-hover-bg);
  color: var(--panel-hover-text);
  transform: translateY(-1px);
}

.leaderboard-row {
  display: flex;
  gap: 4px;
}

@media (max-width: 640px) {
  .bottom-section { gap: 2px; }
  .bottom-row { display: block; }
  .auto-mark-btn { display: none; }
  .new-game-btn { width: 100%; font-size: .72rem; padding: 6px; min-height: 36px; }
  .leaderboard-row { display: none !important; }
}

.lb-btn {
  flex: 1;
  border: none;
  border-radius: 6px;
  padding: 8px;
  background: var(--panel-bg);
  color: var(--panel-text);
  font-size: .75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .12s ease;
  font-family: 'Inter', sans-serif;
}

.lb-btn:hover {
  background: var(--panel-hover-bg);
  color: var(--panel-hover-text);
}

.icon-btn {
  width: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  padding: 8px;
  background: var(--panel-bg);
  color: var(--panel-text);
  cursor: pointer;
  transition: all .12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--panel-hover-bg);
  color: var(--panel-hover-text);
}
</style>
