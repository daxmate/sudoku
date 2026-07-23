<template>
  <div class="board-wrapper">
    <div class="board">
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
        :notes="cell.notes"
        @select="selectCell(cell.row, cell.col)"
        :class="boxBorderClasses(idx)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../composables/useGameStore.js'
import BoardCell from './BoardCell.vue'

const { state, selectCell } = useGameStore()

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
