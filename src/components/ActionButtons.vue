<template>
  <div class="action-buttons">
    <button class="erase-btn" title="擦除" @click="$emit('erase')">
      <svg viewBox="0 0 30 31" width="24" height="24">
        <path fill="currentColor" fill-rule="evenodd" d="M27.13 25.11a1 1 0 01.12 2h-6.9a1 1 0 01-.11-2H27.13zM21.48 4.08l.17.14.16.15 3.76 3.76a4 4 0 01.15 5.5l-.15.16-11.32 11.32h2.04a1 1 0 011 .89v.11a1 1 0 01-.88 1H6.52a3 3 0 01-1.98-.74l-.14-.14-2.23-2.22a4 4 0 01-.15-5.5l.15-.16L16.15 4.37a4 4 0 015.33-.29zm-11.52 9.3l-6.38 6.38a2 2 0 00-.11 2.7l.11.13 2.23 2.23a1 1 0 00.58.28l.13.01h4.9l5.13-5.13-6.59-6.6zm7.87-7.82l-.14.1-.13.13-6.18 6.18 6.59 6.6 6.19-6.2a2 2 0 00.11-2.7l-.11-.12-3.77-3.76a2 2 0 00-2.56-.22z"/>
      </svg>
    </button>

    <button class="mark-cell-btn" title="候选">
      <svg viewBox="0 0 30 30" width="24" height="24" fill="none">
        <rect x="3" y="2" width="24" height="26" rx="2.5" stroke="currentColor" stroke-width="1.5"/>
        <rect x="6" y="5" width="18" height="6.5" rx="1" stroke="currentColor" stroke-width="1.2"/>
        <path stroke="currentColor" stroke-width="1" d="M6 14.5h3v3H6zm5 0h3v3h-3zm5 0h3v3h-3zm5 0h3v3h-3zM6 19.5h3v3H6zm5 0h3v3h-3zm5 0h3v3h-3zm5 0h3v3h-3zM6 24.5h3v3H6zm5 0h3v3h-3zm5 0h3v3h-3zm5 0h3v3h-3z"/>
      </svg>
    </button>

    <button class="notes-toggle" :class="{ active: noteActive }" title="编辑标记" @click="$emit('toggleNotes')">
      <svg viewBox="0 0 30 31" width="24" height="24">
        <path fill="currentColor" d="M25.43 4.76a5.42 5.42 0 01.19 7.52l-.18.2-13.5 13.48a.91.91 0 01-1.21.08l-.1-.08-5.07-5.08-.59 4.34 3.25-.44c.44-.05.84.2 1 .58l.03.11.02.11c.06.47-.24.91-.7 1.03l-.1.02-4.45.6a.94.94 0 01-.79-.27.92.92 0 01-.26-.65v-.13l1-7.4a.92.92 0 01.19-.44l.08-.09L17.71 4.76a5.45 5.45 0 017.72 0zm.35 20.08a1 1 0 110 2h-8.7a1 1 0 010-2h8.7zM21.4 10.18L9.43 22.13 11.3 24l11.95-11.95-1.86-1.86zm-3.23-3.23L6.2 18.91l1.92 1.91L20.07 8.86l-1.9-1.9zm3.42-1.93c-.69 0-1.35.2-1.92.56l-.15.1 5.01 5 .1-.14c.33-.5.51-1.09.55-1.7l.01-.22a3.58 3.58 0 00-3.6-3.6z"/>
      </svg>
    </button>

    <button class="warning" title="提示">
      <svg viewBox="0 0 30 30" width="24" height="24">
        <g fill="currentColor" fill-rule="evenodd">
          <path fill="none" d="M0 0h30v30H0z" />
          <path d="M17.296 25.714c.507 0 .918.48.918 1.072 0 .591-.41 1.071-.918 1.071h-4.592c-.507 0-.918-.48-.918-1.071 0-.592.41-1.072.918-1.072zM15 2.143c.449 0 .89.03 1.322.09a11.84 11.84 0 00-.305 2.122A7.468 7.468 0 0015 4.285c-4.14 0-7.5 3.386-7.5 7.566 0 2.745 1.46 5.23 3.777 6.57.653.377.991 1.094 1.167 2.117.088.515.534.89 1.056.89h2.684c.5 0 .932-.344 1.044-.83.227-.98.731-1.733 1.51-2.186a7.553 7.553 0 002.977-3.188 11.92 11.92 0 001.917.956 9.684 9.684 0 01-3.817 4.084c-.233.136-.399.383-.499.817a3.214 3.214 0 01-3.132 2.49H13.5a3.214 3.214 0 01-3.168-2.67c-.078-.453-.17-.65-.127-.625a9.716 9.716 0 01-4.848-8.425c0-5.36 4.316-9.708 9.643-9.708z"/>
        </g>
      </svg>
      <span class="hint-count">3</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  noteActive: Boolean,
})

defineEmits(['erase', 'toggleNotes'])
</script>

<style scoped>
.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.action-buttons button {
  border: none;
  border-radius: 6px;
  height: 40px;
  padding: 0;
  cursor: pointer;
  transition: all .12s ease;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--action-text);
  background: var(--action-bg);
}

.action-buttons button svg {
  width: 24px;
  height: 24px;
  display: block;
}

.action-buttons button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99,102,241,.2);
  background: var(--action-hover-bg);
  color: var(--action-hover-text);
}

.action-buttons button:active {
  transform: translateY(0);
}

.erase-btn { color: var(--action-erase-text); }
.erase-btn:hover { background: var(--action-erase-hover-bg) !important; color: var(--action-erase-hover-text) !important; }

.notes-toggle.active { background: var(--action-notes-active-bg); color: var(--action-notes-active-text); }

.warning { color: var(--action-warning-text); }
.warning:hover { background: var(--action-warning-hover-bg) !important; color: var(--action-warning-hover-text) !important; }

.mark-cell-btn:hover { background: var(--action-mark-hover-bg) !important; color: var(--action-mark-hover-text) !important; }

.hint-count {
  position: absolute;
  top: -3px;
  right: -3px;
  background: var(--hint-count-bg);
  color: var(--hint-count-text);
  font-size: .5rem;
  font-weight: 500;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}
</style>
