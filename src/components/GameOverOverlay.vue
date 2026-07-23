<template>
  <div v-if="visible" class="overlay">
    <div class="overlay-box">
      <div class="overlay-icon">{{ won ? '🎉' : '💥' }}</div>
      <p class="overlay-msg">{{ won ? '恭喜你完成数独！' : '游戏结束！错误已达上限。' }}</p>
      <div class="overlay-actions">
        <button ref="restartBtn" class="overlay-btn overlay-confirm" @click="$emit('restart')">再来一局</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: Boolean,
  won: Boolean,
})

defineEmits(['restart'])

const restartBtn = ref(null)

watch(() => props.visible, (v) => {
  if (v) {
    nextTick(() => restartBtn.value?.focus())
  }
})
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
  margin: 0 0 20px;
  line-height: 1.5;
}

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
</style>
