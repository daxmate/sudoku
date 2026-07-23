<template>
  <div class="game-header">
    <div class="stat-badge">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/>
        <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>00:00</span>
    </div>
    <div class="stat-badge">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5.5 5.5l5 5m-5 0l5-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      <span>错误 {{ mistakes }} / 3</span>
    </div>
    <div class="stat-badge">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path d="M8 1l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 9.75l-3.52 1.85.67-3.93L2.3 5.14l3.94-.57L8 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
      <span>0</span>
    </div>
    <div class="zoom-control">
      <input type="range" class="zoom-slider" min="70" max="130" value="100" step="5" />
      <span class="zoom-label">100%</span>
    </div>
  </div>

  <div class="difficulty-wrap">
    <button :class="{ active: difficulty === 'easy' }" @click="$emit('selectDifficulty', 'easy')">简单</button>
    <button :class="{ active: difficulty === 'medium' }" @click="$emit('selectDifficulty', 'medium')">中等</button>
    <button :class="{ active: difficulty === 'hard' }" @click="$emit('selectDifficulty', 'hard')">困难</button>
    <button :class="{ active: difficulty === 'expert' }" @click="$emit('selectDifficulty', 'expert')">专家</button>
  </div>
</template>

<script setup>
defineProps({
  difficulty: { type: String, default: 'medium' },
  mistakes: { type: Number, default: 0 },
})
defineEmits(['selectDifficulty'])
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 2px;
  gap: 6px;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--badge-text);
  background: var(--badge-bg);
  padding: 5px 12px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--badge-bg);
  padding: 3px 8px;
  border-radius: 9999px;
}

.zoom-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 60px;
  height: 4px;
  background: var(--zoom-bg);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--zoom-thumb);
  cursor: pointer;
  transition: background .12s ease;
}

.zoom-label {
  font-size: .68rem;
  font-weight: 500;
  color: var(--badge-text);
  min-width: 32px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.difficulty-wrap {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
}

.difficulty-wrap button {
  background: transparent;
  border: 1.5px solid var(--diff-btn-border);
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--diff-btn-text);
  cursor: pointer;
  transition: all .2s ease;
  font-family: 'Inter', sans-serif;
}

.difficulty-wrap button:hover {
  border-color: var(--diff-btn-hover-border);
  color: var(--diff-btn-hover-text);
}

.difficulty-wrap button.active {
  background: var(--diff-btn-active-bg);
  border-color: var(--diff-btn-active-border);
  color: var(--diff-btn-active-text);
}
</style>
