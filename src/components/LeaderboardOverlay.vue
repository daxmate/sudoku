<template>
  <div v-if="visible" class="overlay lb-overlay" @click.self="$emit('close')">
    <div class="overlay-box">
      <div class="lb-header">
        <h2>排行榜</h2>
        <span class="lb-close" @click="$emit('close')">✕</span>
      </div>
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
      <div class="lb-stats" v-if="stats">
        <div class="lb-stat" v-for="s in stats" :key="s.label">
          <div class="lb-stat-value" :class="{ best: s.best }">{{ s.value }}</div>
          <div class="lb-stat-label">{{ s.label }}</div>
        </div>
      </div>
      <div class="lb-list">
        <p v-if="filteredEntries.length === 0" class="lb-empty">暂无游戏记录</p>
        <div v-for="(entry, idx) in filteredEntries" :key="idx" class="lb-entry">
          <div class="lb-rank" :class="rankClass(idx)">{{ idx + 1 }}</div>
          <div class="lb-info">
            <div class="lb-score" :class="{ top1: idx === 0 }">{{ entry.score != null ? entry.score + ' 分' : entry.time }}</div>
            <div class="lb-meta">
              <span class="lb-diff">{{ diffLabel(entry.difficulty) }}</span>
              {{ fmtDate(entry.date) }}
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

defineProps({ visible: Boolean })
defineEmits(['close'])

const filters = [
  { key: 'all', label: '全部' },
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '中等' },
  { key: 'hard', label: '困难' },
  { key: 'expert', label: '专家' },
]

const activeFilter = ref('all')

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('sudoku-history') || '[]')
  } catch (e) { return [] }
}

const allEntries = computed(() => loadHistory())

const filteredEntries = computed(() => {
  const all = loadHistory()
  if (activeFilter.value === 'all') return all
  return all.filter(e => e.difficulty === activeFilter.value)
})

const stats = computed(() => {
  const all = loadHistory()
  const won = all.filter(e => e.won)
  const avgTime = all.length > 0 ? Math.round(all.reduce((s, e) => s + e.seconds, 0) / all.length) : 0
  const fmt = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return [
    { label: '总局数', value: all.length, best: false },
    { label: '胜场', value: won.length, best: true },
    { label: '胜率', value: all.length > 0 ? Math.round(won.length / all.length * 100) + '%' : '-' },
    { label: '平均用时', value: all.length > 0 ? fmt(avgTime) : '-' },
  ]
})

function diffLabel(key) {
  return { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }[key] || key
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function rankClass(idx) {
  if (idx === 0) return 'top1'
  if (idx === 1) return 'top2'
  if (idx === 2) return 'top3'
  return ''
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
  border-bottom: 1px solid var(--lb-header-border);
}

.lb-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--overlay-heading);
  margin: 0;
}

.lb-close {
  font-size: 1rem;
  color: var(--lb-close-text);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all .12s ease;
}

.lb-close:hover {
  background: var(--lb-close-hover-bg);
  color: var(--lb-close-hover-text);
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
  background: var(--lb-filter-bg);
  color: var(--lb-filter-text);
}

.lb-filter.active {
  background: var(--lb-filter-active-bg);
  color: var(--lb-filter-active-text);
}

.lb-filter:hover:not(.active) {
  background: var(--lb-filter-hover-bg);
  color: var(--lb-filter-hover-text);
}

.lb-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 10px 20px 8px;
}

.lb-stat {
  background: var(--lb-stat-bg);
  border-radius: 8px;
  padding: 8px 6px;
  text-align: center;
}

.lb-stat-value {
  font-size: .9rem;
  font-weight: 600;
  color: var(--lb-stat-value);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.lb-stat-value.best { color: var(--lb-stat-best); }

.lb-stat-label {
  font-size: .6rem;
  color: var(--lb-stat-label);
  margin-top: 1px;
}

.lb-list {
  max-height: 340px;
  overflow-y: auto;
  padding: 0 20px;
}

.lb-empty {
  text-align: center;
  color: var(--lb-empty-text);
  font-size: .8rem;
  padding: 32px 0;
}

.lb-entry {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid var(--lb-entry-border);
  font-size: .78rem;
}

.lb-entry:last-child { border-bottom: none; }

.lb-rank {
  font-weight: 600;
  color: var(--lb-rank-text);
  text-align: center;
}

.lb-rank.top1 { color: var(--lb-rank-gold); }
.lb-rank.top2 { color: var(--lb-rank-silver); }
.lb-rank.top3 { color: var(--lb-rank-bronze); }

.lb-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.lb-score {
  font-weight: 600;
  color: var(--lb-score-text);
  font-variant-numeric: tabular-nums;
}

.lb-score.top1 { color: var(--lb-score-gold); }

.lb-meta {
  font-size: .68rem;
  color: var(--lb-meta-text);
}

.lb-diff {
  display: inline-block;
  background: var(--lb-diff-bg);
  padding: 0 5px;
  border-radius: 3px;
  margin-right: 4px;
  color: var(--lb-diff-text);
}

.lb-time {
  font-size: .72rem;
  color: var(--lb-time-text);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>
