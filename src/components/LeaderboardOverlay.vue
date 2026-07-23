<template>
  <div v-if="visible" class="overlay lb-overlay" @click.self="$emit('close')">
    <div class="overlay-box">
      <div class="lb-header">
        <h2>排行榜</h2>
        <span class="lb-close" @click="$emit('close')">✕</span>
      </div>

      <!-- 难度筛选 -->
      <div class="lb-filters">
        <button
          v-for="f in filters"
          :key="f.key"
          class="lb-filter"
          :class="{ active: activeFilter === f.key }"
          @click="activeFilter = f.key"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- 统计 -->
      <div class="lb-stats" v-if="stats">
        <div class="lb-stat" v-for="s in stats" :key="s.label">
          <div class="lb-stat-value" :class="{ best: s.best }">{{ s.value }}</div>
          <div class="lb-stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- 列表 -->
      <div class="lb-list">
        <p v-if="filteredEntries.length === 0" class="lb-empty">暂无游戏记录</p>
        <div
          v-for="(entry, idx) in filteredEntries"
          :key="idx"
          class="lb-entry"
        >
          <div class="lb-rank" :class="`top${idx + 1}`">{{ idx + 1 }}</div>
          <div class="lb-info">
            <div class="lb-score" :class="{ top1: idx === 0 }">{{ entry.score }} 分</div>
            <div class="lb-meta">
              <span class="lb-diff" :class="entry.difficulty">{{ diffLabel(entry.difficulty) }}</span>
              {{ entry.date }}
            </div>
          </div>
          <div class="lb-time">{{ entry.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  visible: Boolean,
})

defineEmits(['close'])

const filters = [
  { key: 'all', label: '全部' },
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '中等' },
  { key: 'hard', label: '困难' },
  { key: 'expert', label: '专家' },
]

const activeFilter = ref('all')

// 示例数据
const allEntries = [
  { score: 2850, difficulty: 'expert', time: '12:34', date: '7/20' },
  { score: 2400, difficulty: 'hard', time: '08:15', date: '7/19' },
  { score: 2100, difficulty: 'medium', time: '06:42', date: '7/21' },
  { score: 1800, difficulty: 'easy', time: '04:30', date: '7/18' },
  { score: 1650, difficulty: 'medium', time: '07:10', date: '7/17' },
  { score: 1500, difficulty: 'hard', time: '09:55', date: '7/16' },
  { score: 1200, difficulty: 'easy', time: '05:20', date: '7/15' },
]

const filteredEntries = computed(() => {
  if (activeFilter.value === 'all') return allEntries
  return allEntries.filter(e => e.difficulty === activeFilter.value)
})

const stats = computed(() => [
  { label: '总局数', value: allEntries.length, best: false },
  { label: '最高分', value: Math.max(...allEntries.map(e => e.score)), best: true },
  { label: '胜率', value: '100%', best: false },
  { label: '平均用时', value: '07:44', best: false },
])

function diffLabel(key) {
  return { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }[key] || key
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.overlay-box {
  background: var(--overlay-bg);
  border-radius: 12px;
  max-width: 330px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  padding: 20px 0 16px;
}

.lb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.lb-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--overlay-heading);
  margin: 0;
}

.lb-close {
  font-size: 1rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all .12s ease;
}

.lb-close:hover {
  background: #f1f4f8;
  color: #475569;
}

.lb-filters {
  display: flex;
  gap: 4px;
  padding: 10px 20px 8px;
  flex-wrap: wrap;
}

.lb-filter {
  border: none;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: .7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .12s ease;
  font-family: 'Inter', sans-serif;
  background: #f1f4f8;
  color: #64748b;
}

.lb-filter.active {
  background: #4f46e5;
  color: #fff;
}

.lb-filter:hover:not(.active) {
  background: #e5e9f0;
  color: #475569;
}

.lb-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 10px 20px 8px;
}

.lb-stat {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 6px;
  text-align: center;
}

.lb-stat-value {
  font-size: .9rem;
  font-weight: 600;
  color: var(--overlay-heading);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.lb-stat-value.best {
  color: #f59e0b;
}

.lb-stat-label {
  font-size: .6rem;
  color: #94a3b8;
  margin-top: 1px;
}

.lb-list {
  max-height: 340px;
  overflow-y: auto;
  padding: 0 20px;
}

.lb-empty {
  text-align: center;
  color: #94a3b8;
  font-size: .8rem;
  padding: 32px 0;
}

.lb-entry {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: .78rem;
}

.lb-entry:last-child {
  border-bottom: none;
}

.lb-rank {
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
}

.lb-rank.top1 { color: #f59e0b; }
.lb-rank.top2 { color: #94a3b8; }
.lb-rank.top3 { color: #d97706; }

.lb-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.lb-score {
  font-weight: 600;
  color: #4f46e5;
  font-variant-numeric: tabular-nums;
}

.lb-score.top1 { color: #f59e0b; }

.lb-meta {
  font-size: .68rem;
  color: #94a3b8;
}

.lb-diff {
  display: inline-block;
  background: #f1f4f8;
  padding: 0 5px;
  border-radius: 3px;
  margin-right: 4px;
}

.lb-time {
  font-size: .72rem;
  color: #64748b;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>

<!-- 暗色主题 -->
<style>
.app.dark .lb-header { border-color: #334155; }
.app.dark .lb-close:hover { background: #475569; color: #e2e8f0; }
.app.dark .lb-filter { background: #1e293b; color: #64748b; }
.app.dark .lb-filter:hover { color: #94a3b8; }
.app.dark .lb-filter.active { background: #6366f1; color: #fff; }
.app.dark .lb-stat { background: #0f172a; }
.app.dark .lb-stat-value { color: #e2e8f0; }
.app.dark .lb-stat-value.best { color: #f59e0b; }
.app.dark .lb-stat-label { color: #64748b; }
.app.dark .lb-empty { color: #475569; }
.app.dark .lb-entry { border-color: #1e293b; }
.app.dark .lb-rank { color: #475569; }
.app.dark .lb-score { color: #cbd5e1; }
.app.dark .lb-score.top1 { color: #f59e0b; }
.app.dark .lb-meta { color: #64748b; }
.app.dark .lb-diff { color: #94a3b8; background: #1e293b; }
.app.dark .lb-time { color: #64748b; }
</style>
