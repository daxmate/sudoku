<template>
  <div
    class="cell"
    :class="{ fixed, user, selected, highlighted, 'same-number': sameNumber, error }"
    @click="$emit('select')"
    role="button"
    :tabindex="0"
    @keydown.enter="$emit('select')"
  >
    <template v-if="value !== 0">
      <span class="cell-value">{{ value }}</span>
    </template>
    <template v-else-if="notes && notes.length > 0">
      <div class="notes-grid">
        <span v-for="n in 9" :key="n" class="note-num" :class="{ 'has-note': notes.includes(n) }">
          {{ notes.includes(n) ? n : '' }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, default: 0 },
  fixed: Boolean,
  user: Boolean,
  selected: Boolean,
  highlighted: Boolean,
  sameNumber: Boolean,
  error: Boolean,
  notes: { type: Array, default: () => [] },
})

defineEmits(['select'])
</script>

<style scoped>
.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--cell-bg);
  font-size: 1.55rem;
  font-weight: 400;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background .1s ease, color .1s ease;
}

.cell.fixed { color: var(--cell-fixed); }
.cell.user { color: var(--cell-user); }

.cell.selected {
  background-color: var(--cell-selected) !important;
  box-shadow: inset 0 0 0 2.5px #6366f1;
  z-index: 2;
}

.cell.highlighted { background-color: var(--cell-highlight); }

.cell.same-number { background-color: var(--cell-same); }

.cell.error {
  background-color: var(--cell-error) !important;
  color: var(--cell-error-text) !important;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  padding: 1px;
}

.note-num {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: .5rem;
  font-weight: 400;
  color: var(--note-text);
  line-height: 1;
}

.note-num.has-note {
  font-weight: 500;
}
</style>
