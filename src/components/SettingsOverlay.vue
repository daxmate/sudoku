<template>
  <div v-if="visible" class="overlay" @click.self="$emit('close')">
    <div class="overlay-box">
      <h3>{{ t('settings.title') }}</h3>
      <div class="setting-row">
        <label>{{ t('settings.autoCalc') }}</label>
        <label class="toggle">
          <input type="checkbox" :checked="autoCalc" @change="$emit('toggleAutoCalc', $event.target.checked)" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>{{ t('settings.autoMark') }}</label>
        <label class="toggle">
          <input type="checkbox" :checked="autoMark" @change="$emit('toggleAutoMark', $event.target.checked)" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>{{ t('settings.depletion') }}</label>
        <label class="toggle">
          <input type="checkbox" :checked="depletion" @change="$emit('toggleDepletion')" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>{{ t('settings.sound') }}</label>
        <label class="toggle">
          <input type="checkbox" :checked="sound" @change="$emit('toggleSound')" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>{{ t('settings.animation') }}</label>
        <label class="toggle">
          <input type="checkbox" :checked="anim" @change="$emit('toggleAnim')" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>{{ t('settings.darkMode') }}</label>
        <label class="toggle">
          <input type="checkbox" :checked="darkMode" @change="$emit('toggleDarkMode')" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row setting-row-vim">
        <label>{{ t('settings.vim') }}</label>
        <label class="toggle">
          <input type="checkbox" :checked="vimMode" @change="$emit('toggleVim')" />
          <span class="toggle-track"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>{{ t('settings.language') }}</label>
        <div class="lang-buttons">
          <button :class="{ active: locale === 'zh-CN' }" @click="$emit('changeLocale', 'zh-CN')">{{ t('settings.zh') }}</button>
          <button :class="{ active: locale === 'en' }" @click="$emit('changeLocale', 'en')">{{ t('settings.en') }}</button>
          <button :class="{ active: locale === 'ja' }" @click="$emit('changeLocale', 'ja')">{{ t('settings.ja') }}</button>
        </div>
      </div>
      <div class="overlay-actions">
        <button class="overlay-btn overlay-confirm" @click="$emit('close')">{{ t('settings.done') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  visible: Boolean,
  autoCalc: Boolean,
  autoMark: Boolean,
  depletion: Boolean,
  sound: Boolean,
  anim: Boolean,
  vimMode: Boolean,
  darkMode: Boolean,
  locale: String,
})
defineEmits(['close', 'toggleAutoCalc', 'toggleAutoMark', 'toggleDepletion', 'toggleSound', 'toggleAnim', 'toggleVim', 'toggleDarkMode', 'changeLocale'])
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

.lang-buttons {
  display: flex;
  gap: 4px;
}

.lang-buttons button {
  padding: 4px 8px;
  border: 1px solid var(--toggle-bg);
  border-radius: 6px;
  background: transparent;
  color: var(--overlay-label);
  font-size: .75rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all .12s ease;
}

.lang-buttons button.active {
  background: var(--overlay-btn-bg);
  color: var(--overlay-btn-text);
  border-color: var(--overlay-btn-bg);
}

.lang-buttons button:hover:not(.active) {
  border-color: var(--overlay-btn-bg);
}

@media (max-width: 640px) {
  .setting-row-vim { display: none; }
}
</style>
