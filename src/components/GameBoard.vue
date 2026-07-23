<template>
  <div class="board-wrapper">
    <div class="board">
      <BoardCell
        v-for="(cell, idx) in cells"
        :key="idx"
        :value="cell.value"
        :fixed="cell.fixed"
        :class="boxBorderClasses(idx)"
      />
    </div>
  </div>
</template>

<script setup>
import BoardCell from './BoardCell.vue'

const puzzle = [
  [5,3,0, 0,7,0, 0,0,0],
  [6,0,0, 1,9,5, 0,0,0],
  [0,9,8, 0,0,0, 0,6,0],
  [8,0,0, 0,6,0, 0,0,3],
  [4,0,0, 8,0,3, 0,0,1],
  [7,0,0, 0,2,0, 0,0,6],
  [0,6,0, 0,0,0, 2,8,0],
  [0,0,0, 4,1,9, 0,0,5],
  [0,0,0, 0,8,0, 0,7,9],
]

const cells = puzzle.flat().map(value => ({
  value,
  fixed: value !== 0,
}))

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
.board-wrapper {
  display: flex;
  justify-content: center;
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
</style>

<style>
.board > .cell {
  border: 0.5px solid var(--cell-border);
  position: relative;
}

.board > .cell.box-border-right::before {
  content: '';
  position: absolute;
  right: -0.5px;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: var(--box-border);
  z-index: 1;
  pointer-events: none;
}

.board > .cell.box-border-bottom::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.5px;
  height: 1.5px;
  background: var(--box-border);
  z-index: 1;
  pointer-events: none;
}
</style>
