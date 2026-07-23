<template>
  <div class="board-wrapper">
    <div ref="boardEl" class="board" style="position:relative">
      <BoardCell
        v-for="(cell, idx) in cells"
        :key="idx"
        :value="cell.value"
        :fixed="cell.fixed"
        :user="cell.user"
        :selected="cell.selected"
        :highlighted="cell.highlighted"
        :same-number="cell.sameNumber"
        :error="cell.error"
        :hinted="cell.hinted"
        :line-complete="cell.lineComplete"
        :pop="cell.pop"
        :shake="cell.shake"
        :notes="cell.notes"
        @select="selectCell(cell.row, cell.col)"
        :class="boxBorderClasses(idx)"
      />
      <!-- 浮动加分文字 -->
      <div
        v-for="s in state.floatingScores"
        :key="s.id"
        class="float-score"
        :style="{
          top: (s.row * cellSize + cellSize * 0.17) + 'px',
          left: (s.col * cellSize + cellSize * 0.13) + 'px',
          color: s.color,
        }"
      >{{ s.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../composables/useGameStore.js'
import BoardCell from './BoardCell.vue'

const { state, selectCell } = useGameStore()
const boardEl = ref(null)

const cellSize = computed(() => {
  if (!boardEl.value) return 48
  return boardEl.value.offsetWidth / 9
})

const cells = computed(() => {
  const grid = state.playerGrid
  const sel = state.selectedCell
  const selVal = sel ? grid[sel.row]?.[sel.col] : 0

  return grid.flat().map((value, idx) => {
    const row = Math.floor(idx / 9)
    const col = idx % 9
    return {
      row, col, value,
      fixed: state.puzzle[row]?.[col] !== 0,
      user: value !== 0 && state.puzzle[row]?.[col] === 0,
      selected: sel?.row === row && sel?.col === col,
      highlighted: sel && (row === sel.row || col === sel.col ||
        (Math.floor(row / 3) === Math.floor(sel.row / 3) &&
         Math.floor(col / 3) === Math.floor(sel.col / 3))),
      sameNumber: selVal !== 0 && value !== 0 && value === selVal,
      error: state.errors.has(`${row},${col}`),
      hinted: state.hintCell === `${row},${col}`,
      lineComplete: state.completedCells.has(`${row},${col}`),
      pop: state.popCell === `${row},${col}`,
      shake: state.shakeCell === `${row},${col}`,
      notes: [...(state.notes[row]?.[col] || [])],
    }
  })
})

function boxBorderClasses(idx) {
  const col = idx % 9
  const row = Math.floor(idx / 9)
  return {
    'box-border-right': col === 2 || col === 5,
    'box-border-bottom': row === 2 || row === 5,
  }
}
</script>

<style scoped>
.board-wrapper { display: flex; justify-content: center; }
@media (max-width: 640px) {
  .board-wrapper { width: 100%; }
}

.board {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 0;
  background: var(--board-line);
  border: 2px solid var(--board-border);
  border-radius: 10px;
  overflow: hidden;
  width: 432px;
  height: 432px;
  box-shadow: var(--board-shadow);
}

@media (max-width: 640px) {
  .board {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    box-sizing: border-box;
    border-width: 1px;
    border-radius: 4px;
  }
}

.float-score {
  position: absolute;
  z-index: 10;
  font-size: .75rem;
  font-weight: 700;
  pointer-events: none;
  animation: floatUp .8s ease-out forwards;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-28px) scale(1.15);
  }
}
</style>

<style>
.board > .cell {
  border: 0.5px solid var(--cell-border);
  position: relative;
}
.board > .cell.box-border-right::before {
  content: ''; position: absolute; right: -0.5px;
  top: 0; bottom: 0; width: 1.5px;
  background: var(--box-border); z-index: 1; pointer-events: none;
}
.board > .cell.box-border-bottom::after {
  content: ''; position: absolute; left: 0; right: 0;
  bottom: -0.5px; height: 1.5px;
  background: var(--box-border); z-index: 1; pointer-events: none;
}
</style>
