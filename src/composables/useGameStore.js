import { reactive } from 'vue'
import SudokuEngine from '../utils/sudokuEngine.js'

const state = reactive({
  puzzle: [],
  solution: [],
  playerGrid: [],
  difficulty: 'medium',
  selectedCell: null,
  notes: [],
  isNoteMode: false,
  isEraseMode: false,
  isAutoCalc: false,
  isAutoMark: false,
})

function initNotes() {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set())
  )
}

function calcCandidates(row, col) {
  const g = state.playerGrid
  const present = new Set()
  for (let i = 0; i < 9; i++) {
    if (g[row][i] !== 0) present.add(g[row][i])
    if (g[i][col] !== 0) present.add(g[i][col])
  }
  const sr = Math.floor(row / 3) * 3
  const sc = Math.floor(col / 3) * 3
  for (let r = sr; r < sr + 3; r++)
    for (let c = sc; c < sc + 3; c++)
      if (g[r][c] !== 0) present.add(g[r][c])

  const candidates = new Set()
  for (let n = 1; n <= 9; n++)
    if (!present.has(n)) candidates.add(n)
  return candidates
}

function refreshAutoMark() {
  if (!state.isAutoMark) return
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (state.playerGrid[r][c] === 0) {
        state.notes[r][c] = calcCandidates(r, c)
      }
    }
  }
}

function refreshSelectedCellNotes() {
  if (!state.isAutoCalc || !state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.playerGrid[row][col] === 0) {
    state.notes[row][col] = calcCandidates(row, col)
  }
}

function newGame(difficulty = state.difficulty) {
  const { puzzle, solution } = SudokuEngine.generatePuzzle(difficulty)
  state.puzzle = puzzle
  state.solution = solution
  state.playerGrid = puzzle.map(row => [...row])
  state.difficulty = difficulty
  state.selectedCell = null
  state.notes = initNotes()
  state.isNoteMode = false
  state.isEraseMode = false
}

function selectCell(row, col) {
  state.selectedCell = { row, col }

  // 擦除模式
  if (state.isEraseMode && state.puzzle[row][col] === 0) {
    state.playerGrid[row][col] = 0
    state.notes[row][col].clear()
    return
  }

  // 自动计算：显示当前格的候选数
  if (state.isAutoCalc && state.playerGrid[row][col] === 0) {
    state.notes[row][col] = calcCandidates(row, col)
  }
}

function placeNumber(num) {
  if (!state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.puzzle[row][col] !== 0) return

  if (state.isEraseMode) {
    state.playerGrid[row][col] = 0
    state.notes[row][col].clear()
    return
  }

  if (state.isNoteMode) {
    const cellNotes = state.notes[row][col]
    if (cellNotes.has(num)) cellNotes.delete(num)
    else cellNotes.add(num)
    return
  }

  state.playerGrid[row][col] = num
  clearNotesForNumber(num, row, col)
}

function clearNotesForNumber(num, row, col) {
  for (let c = 0; c < 9; c++) state.notes[row][c].delete(num)
  for (let r = 0; r < 9; r++) state.notes[r][col].delete(num)
  const sr = Math.floor(row / 3) * 3
  const sc = Math.floor(col / 3) * 3
  for (let r = sr; r < sr + 3; r++)
    for (let c = sc; c < sc + 3; c++)
      state.notes[r][c].delete(num)
}

function eraseCell() {
  if (!state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.puzzle[row][col] !== 0) return
  state.playerGrid[row][col] = 0
  state.notes[row][col].clear()
}

function toggleNoteMode() {
  state.isNoteMode = !state.isNoteMode
  if (state.isNoteMode) state.isEraseMode = false
}

function toggleEraseMode() {
  state.isEraseMode = !state.isEraseMode
  if (state.isEraseMode) state.isNoteMode = false
}

function toggleAutoCalc() {
  state.isAutoCalc = !state.isAutoCalc
  if (!state.isAutoCalc) {
    // 关闭时清除当前格笔记
    if (state.selectedCell) {
      const { row, col } = state.selectedCell
      state.notes[row][col].clear()
    }
  }
}

function toggleAutoMark() {
  state.isAutoMark = !state.isAutoMark
  if (state.isAutoMark) {
    refreshAutoMark()
  } else {
    state.notes = initNotes()
  }
}

export function useGameStore() {
  return {
    state,
    newGame,
    selectCell,
    placeNumber,
    eraseCell,
    toggleNoteMode,
    toggleEraseMode,
    toggleAutoCalc,
    toggleAutoMark,
  }
}
