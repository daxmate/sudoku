<template>
  <div class="bottom-section">
    <div class="bottom-row">
      <button class="new-game-btn" @click="$emit('newGame')">新游戏</button>
    </div>
    <div class="leaderboard-row">
      <button class="lb-btn" @click="$emit('openLeaderboard')">排行榜</button>
      <button class="icon-btn" title="切换暗色主题" @click="$emit('toggleTheme')">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
          <path d="M14 8.79A6.5 6.5 0 117.21 2 5 5 0 0014 8.79z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="icon-btn" title="设置" @click="$emit('openSettings')">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
          <circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.2"/>
          <path d="M8 4.5v-2M8 13.5v-2M11.5 8h2M2.5 8h2M4.5 4.5l1.4 1.4M10.1 10.1l1.4 1.4M4.5 11.5l1.4-1.4M10.1 5.9l1.4-1.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['openSettings', 'newGame', 'openLeaderboard', 'toggleTheme'])
</script>

<style scoped>
.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.leaderboard-row {
  margin-top: auto;
}

.bottom-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4px;
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
  margin-top: auto;
}

@media (max-width: 640px) {
  .bottom-section { gap: 2px; }
  .bottom-row { display: block; }
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
