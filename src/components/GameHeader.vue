<template>
  <div class="game-header">
    <!-- 计时器 -->
    <div class="stat-badge">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/>
        <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>00:00</span>
    </div>

    <!-- 错误计数 -->
    <div class="stat-badge">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5.5 5.5l5 5m-5 0l5-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      <span>错误 0 / 3</span>
    </div>

    <!-- 分数 -->
    <div class="stat-badge">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path d="M8 1l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 9.75l-3.52 1.85.67-3.93L2.3 5.14l3.94-.57L8 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
      <span>0</span>
    </div>

    <!-- 缩放滑条 -->
    <div class="zoom-control">
      <input type="range" class="zoom-slider" min="70" max="130" value="100" step="5" />
      <span class="zoom-label">100%</span>
    </div>
  </div>

  <!-- 难度选择 -->
  <div class="difficulty-wrap">
    <button>简单</button>
    <button class="active">中等</button>
    <button>困难</button>
    <button>专家</button>
  </div>
</template>

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
  color: #6d7584;
  background: #f1f4f8;
  padding: 5px 12px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f4f8;
  padding: 3px 8px;
  border-radius: 9999px;
}

.zoom-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 60px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6d7584;
  cursor: pointer;
  transition: background .12s ease;
}

.zoom-label {
  font-size: .68rem;
  font-weight: 500;
  color: #6d7584;
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
  border: 1.5px solid #e2e8f0;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all .2s ease;
  font-family: 'Inter', sans-serif;
}

.difficulty-wrap button:hover {
  border-color: #a5b4fc;
  color: #6366f1;
}

.difficulty-wrap button.active {
  background: #f1f4f8;
  border-color: #cbd5e1;
  color: #4f46e5;
}
</style>
