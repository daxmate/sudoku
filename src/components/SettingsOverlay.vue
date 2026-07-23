<template>
  <div v-if="visible" class="overlay" @click.self="$emit('close')">
    <div class="overlay-box">
      <h3>设置</h3>
      <div class="setting-row">
        <label>自动计算</label>
        <label class="toggle">
          <input type="checkbox" :checked="autoCalc" @change="$emit('toggleAutoCalc', $event.target.checked)" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>音效</label>
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>动画</label>
        <label class="toggle">
          <input type="checkbox" checked />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="overlay-actions">
        <button class="overlay-btn overlay-confirm" @click="$emit('close')">完成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  autoCalc: Boolean,
})
defineEmits(['close', 'toggleAutoCalc'])
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
  padding: 24px 28px 20px;
  max-width: 280px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  text-align: center;
}

h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--overlay-heading);
  margin: 0 0 16px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.setting-row label:first-child {
  font-size: .82rem;
  color: var(--overlay-label);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  cursor: pointer;
}

.toggle input { opacity: 0; width: 0; height: 0; }

.toggle-track {
  position: absolute;
  inset: 0;
  background: var(--toggle-bg);
  border-radius: 999px;
  transition: background .15s ease;
}

.toggle-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background: var(--toggle-knob);
  border-radius: 50%;
  transition: transform .15s ease;
}

.toggle input:checked + .toggle-track {
  background: var(--toggle-active);
}

.toggle input:checked + .toggle-track::after {
  transform: translateX(14px);
}

.overlay-actions {
  margin-top: 16px;
}

.overlay-btn {
  width: 100%;
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
