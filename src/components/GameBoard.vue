<template>
  <div class="board-wrapper">
    <div class="board">
      <BoardCell
        v-for="(cell, idx) in cells"
        :key="idx"
        :value="cell.value"
        :fixed="cell.fixed"
        :class="borderClasses(idx)"
      />
    </div>
  </div>
</template>

<script setup>
import BoardCell from './BoardCell.vue'

// 静态示例数据 — 展示棋盘布局用
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

function borderClasses(idx) {
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
  gap: 1px;
  background: #e2e8f0;
  border: 2px solid var(--color-board-border);
  border-radius: 10px;
  overflow: hidden;
  width: 432px;
  height: 432px;
  box-shadow: 0 8px 32px rgba(0,0,0,.1);
}
</style>

<!-- 非 scoped：box 边框用全局 class 控制 -->
<style>
.box-border-right {
  border-right: 2px solid var(--color-box-border) !important;
}
.box-border-bottom {
  border-bottom: 2px solid var(--color-box-border) !important;
}
</style>
