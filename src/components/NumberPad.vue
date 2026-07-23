<template>
  <div class="num-grid">
    <button
      v-for="n in 9"
      :key="n"
      :class="{ depleted: count[n] >= 9 }"
      :disabled="count[n] >= 9"
      @click="$emit('place', n)"
    >
      <div class="num-body">
        <div
          class="num-ring"
          :style="ringStyle(n)"
        ></div>
        <span class="num-label">{{ n }}</span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  playerGrid: { type: Array, default: () => [] },
})

defineEmits(['place'])

const count = computed(() => {
  const cnt = Array(10).fill(0)
  if (!props.playerGrid.length) return cnt
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const v = props.playerGrid[r][c]
      if (v > 0) cnt[v]++
    }
  return cnt
})

function ringStyle(n) {
  const pct = (count.value[n] / 9) * 100
  return {
    background: `conic-gradient(currentColor 0% ${pct}%, transparent ${pct}% 100%)`,
    opacity: count.value[n] === 9 ? .08 : .15,
  }
}
</script>

<style scoped>
.num-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.num-grid button {
  position: relative;
  border: none;
  border-radius: 6px;
  background: var(--numpad-bg);
  color: var(--numpad-text);
  cursor: pointer;
  transition: all .12s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
  font-family: 'Inter', sans-serif;
  padding: 4px;
  min-height: 50px;
}

.num-grid button:hover:not(:disabled) {
  background: var(--numpad-hover-bg);
  color: var(--numpad-hover-text);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99,102,241,.2);
}

.num-grid button:active:not(:disabled) {
  transform: translateY(0);
}

.num-grid button.depleted {
  opacity: .25;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  pointer-events: none;
}

.num-body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 44px;
}

.num-label {
  position: relative;
  z-index: 1;
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1;
}

.num-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64%;
  aspect-ratio: 1;
  border-radius: 50%;
  z-index: 0;
  transition: background .2s ease, opacity .2s ease;
}

.depleted .num-ring {
  opacity: .04 !important;
}
</style>
