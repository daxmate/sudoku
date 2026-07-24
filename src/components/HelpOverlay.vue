<template>
  <div v-if="visible" class="overlay" @click.self="$emit('close')">
    <div class="overlay-box help-box">
      <h3>游戏帮助</h3>

      <div class="help-content">
        <div
          v-for="(section, si) in sections"
          :key="si"
          class="help-section"
        >
          <button class="section-header" @click="toggle(si)">
            <span class="section-label">
              <span class="section-num">{{ section.num }}</span>
              {{ section.title }}
            </span>
            <span class="arrow">{{ open[si] ? '▾' : '▸' }}</span>
          </button>
          <div v-show="open[si]" class="section-body">
            <div v-for="(item, ii) in section.items" :key="ii" class="help-item">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
              <div v-if="item.grid" class="demo-wrap" :style="{ marginTop: item.mt || '6px' }">
                <div class="demo-board">
                  <div
                    v-for="(cell, ci) in item.grid"
                    :key="ci"
                    class="demo-cell"
                    :class="cellCls(cell)"
                    :style="cellBorders(ci)"
                  >
                    <span v-if="cell.v" class="demo-val">{{ cell.v }}</span>
                    <div v-if="cell.notes" class="demo-notes">
                      <span
                        v-for="n in cell.notes"
                        :key="n"
                        class="demo-note"
                        :class="{ 'demo-note-x': cell.crossNotes?.includes(n) }"
                      >{{ n }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="overlay-actions">
        <button class="overlay-btn overlay-confirm" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ visible: Boolean })
defineEmits(['close'])

const open = ref({})
function toggle(i) { open.value[i] = !open.value[i] }

function cellCls(cell) {
  const c = []
  if (cell.cls) c.push(cell.cls)
  if (cell.h) c.push('h-' + cell.h)
  return c
}

function cellBorders(idx) {
  const r = Math.floor(idx / 9)
  const c = idx % 9
  const t = r % 3 === 0 ? 3 : 1
  const b = r === 8 ? 3 : (r % 3 === 2 ? 3 : 1)
  const l = c % 3 === 0 ? 3 : 1
  const ri = c === 8 ? 3 : (c % 3 === 2 ? 3 : 1)
  return {
    borderTopWidth: t + 'px',
    borderBottomWidth: b + 'px',
    borderLeftWidth: l + 'px',
    borderRightWidth: ri + 'px',
  }
}

// ─── helpers ───
const E = null

function flat(grid) {
  const cells = []
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      cells.push(grid[r]?.[c] ?? {})
  return cells
}

function setVal(cells, r, c, v, cls) {
  cells[r * 9 + c] = { v, cls }
}
function setNote(cells, r, c, notes, cross, cls) {
  cells[r * 9 + c] = { notes, crossNotes: cross || [], cls: cls || '' }
}

// ─── Well-known sudoku puzzle (used in basic rules) ───
// A moderate difficulty puzzle
function makePuzzle() {
  return [
    [5,3,E, E,7,E, E,E,E],
    [6,E,E, 1,9,5, E,E,E],
    [E,9,8, E,E,E, E,6,E],
    [8,E,E, E,6,E, E,E,3],
    [4,E,E, 8,E,3, E,E,1],
    [7,E,E, E,2,E, E,E,6],
    [E,6,E, E,E,E, 2,8,E],
    [E,E,E, 4,1,9, E,E,5],
    [E,E,E, E,8,E, E,7,9],
  ]
}

function puzzleCells() {
  const g = makePuzzle()
  return g.flatMap((row, r) =>
    row.map((v, c) => (v ? { v, cls: 'demo-clue' } : { cls: 'demo-empty' }))
  )
}

// ─── Sections ───

const sections = [
  // ──── 基本规则 ──────
  {
    num: '①',
    title: '基本规则',
    items: [
      {
        title: '目标',
        desc: '在 9×9 的格子中填入数字 1~9，使每行、每列、每个 3×3 粗框宫格内，数字 1~9 各出现一次。',
      },
      {
        title: '三大约束',
        desc: '同一行、同一列、同一宫内，数字不能重复。下图用不同颜色标出了这三种约束区域。',
        mt: '4px',
        grid: (() => {
          const cells = puzzleCells()
          // Highlight row 3 (0-indexed), all cols
          for (let c = 0; c < 9; c++) cells[3 * 9 + c].h = 'row'
          // Highlight col 4
          for (let r = 0; r < 9; r++) cells[r * 9 + 4].h = 'col'
          // Highlight center box (rows 3-5, cols 3-5)
          for (let r = 3; r < 6; r++)
            for (let c = 3; c < 6; c++)
              cells[r * 9 + c].h = 'box'
          return cells
        })(),
      },
    ],
  },

  // ──── 入门技巧 ──────
  {
    num: '②',
    title: '入门技巧',
    items: [
      {
        title: '唯一数（Naked Single）',
        desc: '如果某个格子所在的行、列、宫中已经出现了 8 个不同的数字，那么这个格子只能填剩下的那个。下图中蓝色格子只能填 9。',
        grid: (() => {
          // Create a grid where top-left box has 8 numbers, one empty
          const cells = puzzleCells()
          // Override top-left box: fill 1-8, leave (2,2) empty
          const vals = [5,3,E, 6,E,E, E,9,8] // existing: 5,3,6,9,8 in box
          // We need to add 1,2,4,7 to make 8 filled cells. Replace some cells.
          // Clear existing top-left box cells
          for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++)
              cells[r*9+c] = { cls: 'demo-empty' }
          // Fill 7 of 8 cells with numbers from box, leaving (2,2) for answer
          setVal(cells, 0,0, 1, 'demo-clue')
          setVal(cells, 0,1, 2, 'demo-clue')
          setVal(cells, 0,2, 3, 'demo-clue')
          setVal(cells, 1,0, 4, 'demo-clue')
          setVal(cells, 1,1, 5, 'demo-clue')
          setVal(cells, 1,2, 6, 'demo-clue')
          setVal(cells, 2,0, 7, 'demo-clue')
          setVal(cells, 2,1, 8, 'demo-clue')
          setVal(cells, 2,2, 9, 'demo-answer')
          // Keep row 2 highlighting subtle: row 2 already has 7,8,9 plus puzzle numbers
          // Mark box members visually
          for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++)
              if (cells[r*9+c].cls !== 'demo-clue' && cells[r*9+c].cls !== 'demo-answer')
                cells[r*9+c].h = 'box'
          return cells
        })(),
      },
      {
        title: '唯余法（Hidden Single）',
        desc: '在某行/列/宫中，某个数字 1~9 中有一个只能填入唯一的格子。即使这个格子有其他候选数，也能确定答案。\n\n看下面棋盘：第 1 行要放数字 6，但每一列都已经有 6 了，只剩下第 5 列还没有 6。所以第 1 行第 5 列只能是 6 —— 这就是唯余法。',
        mt: '4px',
        grid: (() => {
          // Hidden Single for number 6 in Row 0 (1-indexed: 第1行)
          // Every column except col 4 has a 6 in a different row.
          // Cell (0,4) is the only place 6 can go in row 0.
          const cells = Array.from({ length: 81 }, () => ({ cls: 'demo-empty' }))
          // Block each column with a 6 in a different row
          // Col 0: 6 at (4,0)
          // Col 1: 6 at (2,1)
          // Col 2: 6 at (5,2)
          // Col 3: 6 at (7,3)
          // Col 4: NO 6 → answer at (0,4)
          // Col 5: 6 at (3,5)
          // Col 6: 6 at (1,6)
          // Col 7: 6 at (6,7)
          // Col 8: 6 at (8,8)
          setVal(cells, 4, 0, 6, 'demo-clue')
          setVal(cells, 2, 1, 6, 'demo-clue')
          setVal(cells, 5, 2, 6, 'demo-clue')
          setVal(cells, 7, 3, 6, 'demo-clue')
          setVal(cells, 3, 5, 6, 'demo-clue')
          setVal(cells, 1, 6, 6, 'demo-clue')
          setVal(cells, 6, 7, 6, 'demo-clue')
          setVal(cells, 8, 8, 6, 'demo-clue')
          // Answer
          setVal(cells, 0, 4, 6, 'demo-answer')
          // Add context numbers to make the grid look real
          setVal(cells, 0, 0, 5, 'demo-clue')
          setVal(cells, 0, 1, 3, 'demo-clue')
          setVal(cells, 0, 8, 4, 'demo-clue')
          setVal(cells, 1, 0, 7, 'demo-clue')
          setVal(cells, 1, 3, 9, 'demo-clue')
          setVal(cells, 1, 8, 2, 'demo-clue')
          setVal(cells, 2, 0, 1, 'demo-clue')
          setVal(cells, 2, 3, 8, 'demo-clue')
          setVal(cells, 3, 0, 9, 'demo-clue')
          setVal(cells, 4, 3, 3, 'demo-clue')
          setVal(cells, 5, 3, 4, 'demo-clue')
          setVal(cells, 5, 8, 7, 'demo-clue')
          setVal(cells, 6, 0, 2, 'demo-clue')
          setVal(cells, 6, 2, 7, 'demo-clue')
          setVal(cells, 7, 0, 4, 'demo-clue')
          setVal(cells, 7, 8, 1, 'demo-clue')
          setVal(cells, 8, 1, 8, 'demo-clue')
          setVal(cells, 8, 2, 9, 'demo-clue')
          // Show blocking: in row 0, mark each non-answer cell as blocked for 6
          for (let c = 0; c < 9; c++) {
            if (c === 4) continue // skip answer cell
            setNote(cells, 0, c, [6], [6], 'demo-eliminate')
          }
          // Highlight the entire row 0
          for (let c = 0; c < 9; c++) {
            cells[0*9+c].h = 'row'
          }
          return cells
        })(),
      },
    ],
  },

  // ──── 进阶技巧 ──────
  {
    num: '③',
    title: '进阶技巧',
    items: [
      {
        title: '摒除法（宫行排除）',
        desc: '某行中，如果数字 X 只能出现在同一个宫内，那么该宫其他行的 X 候选可以排除。\n\n看下图：第 3 行要放数字 7，但第 4~9 列在其他行已有 7（红底叉号），第 3 行第 5 列和第 7 列也已填其他数，所以 7 只能放在第 1~3 列（左上宫，紫底标记）。→ 左上宫内不在第 3 行的格子都不能有 7（红底叉号）。',
        grid: (() => {
          const cells = Array.from({ length: 81 }, () => ({ cls: 'demo-empty' }))
          // Row 2 (0-indexed: 第3行), candidate 7
          // Block cols 3-8 by placing 7 in same column (validated grid)
          setVal(cells, 8, 3, 7, 'demo-clue')  // col 3: 7 at (9,4)
          setVal(cells, 1, 4, 7, 'demo-clue')  // col 4: 7 at (2,5)
          setVal(cells, 4, 5, 7, 'demo-clue')  // col 5: 7 at (5,6)
          setVal(cells, 0, 6, 7, 'demo-clue')  // col 6: 7 at (1,7)
          setVal(cells, 3, 7, 7, 'demo-clue')  // col 7: 7 at (4,8)
          setVal(cells, 7, 8, 7, 'demo-clue')  // col 8: 7 at (8,9)
          // Row 2 context numbers
          setVal(cells, 2, 4, 8, 'demo-clue')
          setVal(cells, 2, 6, 5, 'demo-clue')
          // Row 2, cols 0-2: 7 can go here (in Box 0) → focus
          setNote(cells, 2, 0, [7], [], 'demo-focus')
          setNote(cells, 2, 1, [7], [], 'demo-focus')
          setNote(cells, 2, 2, [7], [], 'demo-focus')
          // Row 2, cols 3-8: 7 blocked by column (show crossed-out note)
          setNote(cells, 2, 3, [7], [7], 'demo-eliminate')
          setNote(cells, 2, 5, [7], [7], 'demo-eliminate')
          setNote(cells, 2, 7, [7], [7], 'demo-eliminate')
          setNote(cells, 2, 8, [7], [7], 'demo-eliminate')
          // Box 0 (rows 0-2, cols 0-2), non-row-2 cells: 7 eliminated
          setNote(cells, 0, 0, [7], [7], 'demo-eliminate')
          setNote(cells, 0, 1, [7], [7], 'demo-eliminate')
          setNote(cells, 0, 2, [7], [7], 'demo-eliminate')
          setNote(cells, 1, 0, [7], [7], 'demo-eliminate')
          setNote(cells, 1, 1, [7], [7], 'demo-eliminate')
          setNote(cells, 1, 2, [7], [7], 'demo-eliminate')
          // Context numbers in Box 0
          setVal(cells, 0, 0, 6, 'demo-clue')
          setVal(cells, 0, 1, 8, 'demo-clue')
          setVal(cells, 0, 2, 9, 'demo-clue')
          setVal(cells, 1, 0, 2, 'demo-clue')
          setVal(cells, 1, 1, 3, 'demo-clue')
          setVal(cells, 1, 2, 5, 'demo-clue')
          // More context numbers
          setVal(cells, 0, 3, 1, 'demo-clue')
          setVal(cells, 0, 4, 2, 'demo-clue')
          setVal(cells, 0, 5, 3, 'demo-clue')
          setVal(cells, 1, 3, 4, 'demo-clue')
          setVal(cells, 1, 5, 6, 'demo-clue')
          setVal(cells, 3, 0, 4, 'demo-clue')
          // Highlight row 2
          for (let c = 0; c < 9; c++) cells[2*9+c].h = 'row'
          return cells
        })(),
      },
      {
        title: '数对法（Naked Pair）',
        desc: '某行/列/宫中，如果两个格子都只包含相同的两个候选数，它们就构成数对。这两个数可以从该单元的其他格子中排除。\n\n看下图：第 4 行的两个橙色格子构成 {2,7} 数对，因此同行的第 3 列（蓝底）不能是 2 或 7。它本来有候选 {2,3,7}，排除后只剩 3——答案出来了！',
        grid: (() => {
          const cells = Array.from({ length: 81 }, () => ({ cls: 'demo-empty' }))
          // Row 3 (0-indexed): col 1 and col 4 form a {2,7} naked pair
          setNote(cells, 3, 1, [2,7], [], 'demo-pair')
          setNote(cells, 3, 4, [2,7], [], 'demo-pair')
          // Cell (3,2) originally had {2,3,7}, now 2,7 eliminated → answer is 3
          cells[3*9+2] = { v: 3, notes: [2,3,7], crossNotes: [2,7], cls: 'demo-answer' }
          // Other cells in row 3 (not pair, not answer): 2,7 eliminated
          setNote(cells, 3, 0, [2,7], [2,7], 'demo-eliminate')
          setNote(cells, 3, 3, [2,7], [2,7], 'demo-eliminate')
          setNote(cells, 3, 5, [2,7], [2,7], 'demo-eliminate')
          setNote(cells, 3, 6, [2,7], [2,7], 'demo-eliminate')
          setNote(cells, 3, 7, [2,7], [2,7], 'demo-eliminate')
          setNote(cells, 3, 8, [2,7], [2,7], 'demo-eliminate')
          // Context numbers in other rows
          setVal(cells, 0, 1, 1, 'demo-clue')
          setVal(cells, 0, 4, 5, 'demo-clue')
          setVal(cells, 1, 2, 4, 'demo-clue')
          setVal(cells, 2, 0, 6, 'demo-clue')
          setVal(cells, 2, 5, 8, 'demo-clue')
          setVal(cells, 4, 0, 9, 'demo-clue')
          setVal(cells, 4, 7, 1, 'demo-clue')
          setVal(cells, 5, 3, 5, 'demo-clue')
          setVal(cells, 6, 1, 3, 'demo-clue')
          setVal(cells, 6, 6, 6, 'demo-clue')
          setVal(cells, 7, 8, 2, 'demo-clue')
          setVal(cells, 8, 0, 8, 'demo-clue')
          setVal(cells, 8, 5, 7, 'demo-clue')
          // Highlight row 3
          for (let c = 0; c < 9; c++) cells[3*9+c].h = 'row'
          return cells
        })(),
      },
      {
        title: '三链数（Naked Triple）',
        desc: '数对的扩展。三个格子的候选数合起来只包含三个不同的数字，则这三个数可以从该单元的其他格子中排除。下图中，橙色格子构成 {1,4,9} 三链数。',
        grid: (() => {
          const cells = Array.from({ length: 81 }, () => ({ cls: 'demo-empty' }))
          // Row 5: cols 2, 5, 7 form {1,4,9} naked triple
          setNote(cells, 5, 2, [1,4,9], [], 'demo-pair')
          setNote(cells, 5, 5, [1,4], [], 'demo-pair')
          setNote(cells, 5, 7, [4,9], [], 'demo-pair')
          // Other cells in row 5: 1,4,9 eliminated
          for (let c = 0; c < 9; c++) {
            if (c === 2 || c === 5 || c === 7) continue
            setNote(cells, 5, c, [1,4,9], [1,4,9], 'demo-eliminate')
          }
          // Context
          setVal(cells, 3, 0, 2, 'demo-clue')
          setVal(cells, 3, 3, 3, 'demo-clue')
          setVal(cells, 4, 1, 5, 'demo-clue')
          setVal(cells, 4, 4, 6, 'demo-clue')
          setVal(cells, 4, 6, 7, 'demo-clue')
          setVal(cells, 6, 2, 8, 'demo-clue')
          return cells
        })(),
      },
    ],
  },

  // ──── 高级技巧 ──────
  {
    num: '④',
    title: '高级技巧',
    items: [
      {
        title: 'X-Wing',
        desc: '某数字在 两行 中都只可能出现在相同的 两列 中，则这两列的其他行可以排除该数字。图形呈 X 形状。下图中数字 3 在行 1、7 都只能出现在列 3、6。',
        grid: (() => {
          const cells = Array.from({ length: 81 }, () => ({ cls: 'demo-empty' }))
          // X-Wing on 3: rows 1 and 7, cols 3 and 6
          setNote(cells, 1, 3, [3], [], 'demo-pair')
          setNote(cells, 1, 6, [3], [], 'demo-pair')
          setNote(cells, 7, 3, [3], [], 'demo-pair')
          setNote(cells, 7, 6, [3], [], 'demo-pair')
          // Col 3, other rows: 3 eliminated
          for (let r = 0; r < 9; r++) {
            if (r === 1 || r === 7) continue
            setNote(cells, r, 3, [3], [3], 'demo-eliminate')
          }
          // Col 6, other rows: 3 eliminated
          for (let r = 0; r < 9; r++) {
            if (r === 1 || r === 7) continue
            setNote(cells, r, 6, [3], [3], 'demo-eliminate')
          }
          // Context
          [0,2,3,4,5,6,8].forEach((r, i) => setVal(cells, r, 0, i+1, 'demo-clue'))
          setVal(cells, 1, 0, 4, 'demo-clue')
          setVal(cells, 7, 0, 5, 'demo-clue')
          setVal(cells, 1, 8, 7, 'demo-clue')
          setVal(cells, 7, 8, 8, 'demo-clue')
          return cells
        })(),
      },
      {
        title: 'XY-Wing',
        desc: '三个格子 A{X,Y}、B{X,Z}、C{Y,Z} 形成 XY-Wing。B 和 C 共同影响的格子不能是 Z。下图中 A(1,5)、B(1,7)、C(4,5) 形成 XY-Wing，排除(4,7)的 8。',
        grid: (() => {
          const cells = Array.from({ length: 81 }, () => ({ cls: 'demo-empty' }))
          // A at (1,5) = {1,5}
          setNote(cells, 1, 5, [1,5], [], 'demo-pair')
          // B at (1,7) = {1,8}
          setNote(cells, 1, 7, [1,8], [], 'demo-pair')
          // C at (4,5) = {5,8}
          setNote(cells, 4, 5, [5,8], [], 'demo-pair')
          // Cell at (4,7) can see both B and C → 8 eliminated
          setNote(cells, 4, 7, [8], [8], 'demo-eliminate')
          // Context
          setVal(cells, 0, 0, 2, 'demo-clue')
          setVal(cells, 0, 4, 3, 'demo-clue')
          setVal(cells, 2, 2, 4, 'demo-clue')
          setVal(cells, 3, 1, 6, 'demo-clue')
          setVal(cells, 5, 3, 7, 'demo-clue')
          setVal(cells, 5, 6, 9, 'demo-clue')
          return cells
        })(),
      },
      {
        title: '链式推理',
        desc: '通过"如果 A 是 X 则导致矛盾，因此 A 必须是 Y"的推理方式求解。适用于最难的专家题目，通常需要配合候选数标记手动推算。',
      },
    ],
  },
]
</script>

<style scoped>
/* ─── Overlay container ─── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.help-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px 18px;
  max-width: 380px;
  width: 90%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
}
.help-box h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 10px;
  text-align: center;
}
.help-content {
  flex: 1;
  overflow-y: auto;
  margin: 0 -6px;
  padding: 0 6px;
}

/* ─── Accordion sections ─── */
.help-section {
  border-bottom: 1px solid #e2e8f0;
}
.help-section:last-child { border-bottom: none; }

.section-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.section-header:hover .section-label { color: #6366f1; }

.section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .82rem;
  font-weight: 600;
  color: #334155;
  transition: color .12s;
}
.section-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: .65rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  background: #6366f1;
}

.help-section:nth-child(1) .section-num { background: #6366f1; }
.help-section:nth-child(2) .section-num { background: #059669; }
.help-section:nth-child(3) .section-num { background: #d97706; }
.help-section:nth-child(4) .section-num { background: #dc2626; }
.arrow {
  font-size: .7rem;
  color: #94a3b8;
}

.section-body {
  padding: 0 2px 10px;
}

/* ─── Technique items ─── */
.help-item {
  margin-bottom: 14px;
}
.help-item:last-child { margin-bottom: 0; }
.help-item h4 {
  font-size: .75rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 3px;
}
.help-item p {
  font-size: .7rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

/* ─── Demo board ─── */
.demo-wrap {
  display: flex;
  justify-content: center;
}
.demo-board {
  display: grid;
  grid-template-columns: repeat(9, 26px);
  grid-template-rows: repeat(9, 26px);
  border: 3px solid #64748b;
  border-radius: 3px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

/* Cell borders match game style */
.demo-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .7rem;
  font-weight: 500;
  color: #334155;
  background: #fff;
  border-color: #d1d5db;
  border-style: solid;
}

.demo-val {
  line-height: 1;
  pointer-events: none;
}

/* ─── Notes on cells ─── */
.demo-notes {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 1px;
}
.demo-note {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .45rem;
  color: #94a3b8;
  line-height: 1;
}
.demo-note-x {
  text-decoration: line-through;
  color: #dc2626;
  font-weight: 600;
}

/* ─── Cell type classes ─── */
.demo-clue {
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 700;
}
.demo-answer {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
}
.demo-pair {
  background: #fef9c3;
  font-weight: 600;
}
.demo-eliminate {
  background: #fee2e2;
}
.demo-focus {
  background: #ede9fe;
}
.demo-empty { background: #fff; }

/* ─── Highlight overlays ─── */
.h-row {
  background: #dbeafe !important;
}
.h-col {
  background: #dcfce7 !important;
}
.h-box {
  background: #fef9c3 !important;
}
/* When a cell has both row+col highlights, use the box highlight as priority */
.h-box.h-col,
.h-box.h-row {
  background: #fef9c3 !important;
}

/* ─── Close button ─── */
.overlay-actions {
  padding-top: 10px;
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
  background: #f1f4f8;
  color: #6366f1;
}
.overlay-confirm:hover {
  background: #e2e8f0;
}

@media (max-width: 640px) {
  .help-box {
    max-width: 92vw;
    padding: 16px 14px 14px;
  }
  .demo-board {
    grid-template-columns: repeat(9, 22px);
    grid-template-rows: repeat(9, 22px);
  }
  .demo-cell { font-size: .6rem; }
  .demo-note { font-size: .4rem; }
}
</style>
