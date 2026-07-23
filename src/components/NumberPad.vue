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
        <div class="num-dots">
          <span
            v-for="i in 9"
            :key="i"
            class="dot"
            :class="{ filled: i <= count[n] }"
          ></span>
        </div>
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
}

.num-label {
  position: relative;
  z-index: 1;
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1;
}

.num-dots {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  padding: 5px;
  z-index: 0;
}

.dot {
  border-radius: 2px;
  background: var(--numpad-text);
  opacity: .04;
  transition: opacity .15s ease;
}

.dot.filled {
  opacity: .15;
}

.depleted .dot {
  opacity: .01;
}

.depleted .dot.filled {
  opacity: .05;
}
</style>
