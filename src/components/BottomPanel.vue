<template>
  <div class="bottom-section">
    <!-- 底部行：全部标记 + 新游戏 -->
    <div class="bottom-row">
      <button class="auto-mark-btn" title="全部标记">
        <svg viewBox="0 0 30 30" width="24" height="24" fill="none">
          <circle cx="15" cy="16" r="8.5" stroke="currentColor" stroke-width="1.5"/>
          <rect x="13.5" y="6" width="3" height="3" rx=".6" stroke="currentColor" stroke-width="1.3"/>
          <path d="M15 6q3-2 1-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="new-game-btn" @click="$emit('newGame')">新游戏</button>
    </div>

    <!-- 底部按钮行：排行榜 + 主题 + 设置 -->
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

.auto-mark-btn {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  border-radius: 6px;
  background: #f1f4f8;
  color: #6d7584;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
}

.auto-mark-btn:hover {
  background: #e5e9f0;
  color: #065f46;
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
  background: #f1f4f8;
  color: #6d7584;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
}

.new-game-btn:hover {
  background: #e5e9f0;
  color: #4f46e5;
  transform: translateY(-1px);
}

.leaderboard-row {
  display: flex;
  gap: 4px;
}

.lb-btn {
  flex: 1;
  border: none;
  border-radius: 6px;
  padding: 8px;
  background: #f1f4f8;
  color: #6d7584;
  font-size: .75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .12s ease;
  font-family: 'Inter', sans-serif;
}

.lb-btn:hover {
  background: #e5e9f0;
  color: #4f46e5;
}

.icon-btn {
  width: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  padding: 8px;
  background: #f1f4f8;
  color: #6d7584;
  cursor: pointer;
  transition: all .12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #e5e9f0;
  color: #4f46e5;
}
</style>
