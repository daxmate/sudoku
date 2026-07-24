<template>
  <div v-if="visible" class="overlay" @click.self="$emit('cancel')">
    <div class="overlay-box">
      <p class="overlay-msg">{{ message }}</p>
      <div class="overlay-actions">
        <button class="overlay-btn overlay-cancel" @click="$emit('cancel')">{{ t('confirm.cancel') }}</button>
        <button class="overlay-btn overlay-confirm" @click="$emit('confirm')">{{ t('confirm.confirm') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  visible: Boolean,
  message: { type: String, default: '' },
})

defineEmits(['confirm', 'cancel'])
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
  padding: 24px 28px 20px;
  max-width: 280px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  text-align: center;
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

.overlay-cancel {
  background: var(--overlay-cancel-bg);
  color: var(--overlay-cancel-text);
}
.overlay-cancel:hover {
  background: var(--overlay-cancel-hover-bg);
  color: var(--overlay-cancel-hover-text);
}
</style>
