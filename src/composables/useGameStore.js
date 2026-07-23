import { reactive, readonly } from 'vue'
import SudokuEngine from '../utils/sudokuEngine.js'

const state = reactive({
  puzzle: [],
  solution: [],
  playerGrid: [],
  difficulty: 'medium',
  selectedCell: null,
  notes: [],
  isNoteMode: false,
})

function initNotes() {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set())
  )
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
}

function selectCell(row, col) {
  state.selectedCell = { row, col }
}

function clearSelection() {
  state.selectedCell = null
}

function placeNumber(num) {
  if (!state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.puzzle[row][col] !== 0) return

  // 笔记模式：切换笔记
  if (state.isNoteMode) {
    const cellNotes = state.notes[row][col]
    if (cellNotes.has(num)) {
      cellNotes.delete(num)
    } else {
      cellNotes.add(num)
    }
    return
  }

  // 普通模式：填数字
  state.playerGrid[row][col] = num
  // 填数后清除该单元内同名笔记
  clearNotesForNumber(num, row, col)
}

function clearNotesForNumber(num, row, col) {
  for (let c = 0; c < 9; c++) state.notes[row][c].delete(num)
  for (let r = 0; r < 9; r++) state.notes[r][col].delete(num)
  const sr = Math.floor(row / 3) * 3
  const sc = Math.floor(col / 3) * 3
  for (let r = sr; r < sr + 3; r++) {
    for (let c = sc; c < sc + 3; c++) {
      state.notes[r][c].delete(num)
    }
  }
}

function eraseCell() {
  if (!state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.puzzle[row][col] !== 0) return
  state.playerGrid[row][col] = 0
  // 擦除时也清空该格的笔记
  state.notes[row][col].clear()
}

function toggleNoteMode() {
  state.isNoteMode = !state.isNoteMode
}

export function useGameStore() {
  return {
    state: readonly(state),
    newGame,
    selectCell,
    clearSelection,
    placeNumber,
    eraseCell,
    toggleNoteMode,
  }
}
