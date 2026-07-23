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
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (state.playerGrid[r][c] === 0)
        state.notes[r][c] = calcCandidates(r, c)
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

  // 自动计算设置开启时，自动显示候选
  if (state.isAutoCalc && state.playerGrid[row][col] === 0) {
    state.notes[row][col] = calcCandidates(row, col)
  }
}

function placeNumber(num) {
  if (!state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.puzzle[row][col] !== 0) return

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
  // 不清理笔记
}

function toggleNoteMode() {
  state.isNoteMode = !state.isNoteMode
}

function toggleAutoCalc(on) {
  state.isAutoCalc = on
  if (on && state.selectedCell) {
    const { row, col } = state.selectedCell
    if (state.playerGrid[row][col] === 0)
      state.notes[row][col] = calcCandidates(row, col)
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
    toggleAutoCalc,
    toggleAutoMark,
  }
}
