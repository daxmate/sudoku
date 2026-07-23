<template>
  <div v-if="visible" class="overlay">
    <div class="overlay-box">
      <div class="overlay-icon">{{ won ? '🎉' : '💥' }}</div>
      <p class="overlay-msg">{{ won ? '恭喜你完成数独！' : '游戏结束！错误已达上限。' }}</p>
      <div v-if="won" class="score-detail">
        <div v-for="row in scoreDetail" :key="row.label" class="sd-row" :class="{ 'sd-total': row.total }">
          <span class="sd-label">{{ row.label }}</span>
          <span class="sd-val">{{ row.value }}</span>
        </div>
      </div>
      <div class="overlay-actions">
        <button ref="restartBtn" class="overlay-btn overlay-confirm" @click="$emit('restart')">再来一局</button>
        <button class="overlay-btn overlay-secondary" @click="$emit('view-leaderboard')">排行榜</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useGameStore } from '../composables/useGameStore.js'

const props = defineProps({
  visible: Boolean,
  won: Boolean,
})

defineEmits(['restart', 'view-leaderboard'])

const restartBtn = ref(null)

watch(() => props.visible, (v) => {
  if (v) {
    nextTick(() => restartBtn.value?.focus())
  }
})

const game = useGameStore()

const scoreDetail = computed(() => {
  const s = game.state
  const diffMult = { easy: 1, medium: 1.5, hard: 2.5, expert: 4 }
  const diffLabel = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  const m = diffMult[s.difficulty] || 1
  const dl = diffLabel[s.difficulty] || s.difficulty

  const base = Math.round(s.score * m)
  const bonus = 100 * m
  const noHint = (3 - s.hintsRemaining) === 0 ? 200 * m : 0
  const noError = s.mistakes === 0 ? 150 * m : 0
  const timeBonus = Math.max(0, Math.round((1800 - s.elapsedSeconds) * 0.5 * m))
  const total = base + bonus + noHint + noError + timeBonus

  const fmt = (n) => `${n > 0 ? '+' : ''}${Math.round(n)}`
  const fmtTime = (sec) => {
    const m = Math.floor(sec / 60)
    return `${String(m).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
  }

  const rows = [
    { label: '难度', value: `${dl} (×${m})`, total: false },
    { label: '基础分', value: fmt(base), total: false },
    { label: '通关奖励', value: fmt(bonus), total: false },
  ]
  if (noHint) rows.push({ label: '无提示奖励', value: fmt(noHint), total: false })
  if (noError) rows.push({ label: '无错误奖励', value: fmt(noError), total: false })
  if (timeBonus) rows.push({ label: '时间奖励', value: fmt(timeBonus), total: false })
  rows.push(
    { label: '用时', value: fmtTime(s.elapsedSeconds), total: false },
    { label: '错误', value: String(s.mistakes), total: false },
    { label: '提示', value: String(3 - s.hintsRemaining), total: false },
    { label: '总分', value: total, total: true },
  )
  return rows
})
</script>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.35);
  border-radius: 28px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.overlay-box {
  background: var(--overlay-bg);
  border-radius: 12px;
  padding: 28px 28px 20px;
  max-width: 280px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  text-align: center;
}

.overlay-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.overlay-msg {
  font-size: .9rem;
  color: var(--overlay-heading);
  margin: 0 0 14px;
  line-height: 1.5;
}

.score-detail {
  margin: 0 auto 14px;
  padding: 10px 14px;
  background: var(--score-detail-bg);
  border-radius: 8px;
  font-size: .76rem;
  line-height: 1.7;
  color: var(--score-detail-text);
  text-align: left;
  max-width: 240px;
}

.sd-row {
  display: flex;
  justify-content: space-between;
  padding: 1px 0;
}

.sd-row.sd-total {
  border-top: 1px solid var(--score-detail-border);
  margin-top: 4px;
  padding-top: 5px;
  font-weight: 600;
  color: var(--score-detail-total);
}

.sd-label { color: var(--score-detail-label); }
.sd-val { font-weight: 500; font-variant-numeric: tabular-nums; }

.overlay-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.overlay-btn {
  flex: 1;
  padding: 9px 0;
  border: none;
  border-radius: 8px;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all .12s ease;
}

.overlay-confirm {
  background: var(--overlay-btn-bg);
  color: var(--overlay-btn-text);
}
.overlay-confirm:hover {
  background: var(--overlay-btn-hover-bg);
}

.overlay-secondary {
  background: var(--overlay-cancel-bg);
  color: var(--overlay-cancel-text);
}
.overlay-secondary:hover {
  background: var(--overlay-cancel-hover-bg);
  color: var(--overlay-cancel-hover-text);
}
</style>
