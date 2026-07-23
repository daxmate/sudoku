import { reactive, readonly } from 'vue'
import SudokuEngine from '../utils/sudokuEngine.js'

const state = reactive({
  puzzle: [],
  solution: [],
  playerGrid: [],
  difficulty: 'medium',
  selectedCell: null,
})

function newGame(difficulty = state.difficulty) {
  const { puzzle, solution } = SudokuEngine.generatePuzzle(difficulty)
  state.puzzle = puzzle
  state.solution = solution
  state.playerGrid = puzzle.map(row => [...row])
  state.difficulty = difficulty
  state.selectedCell = null
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
  // 给定数字不能改
  if (state.puzzle[row][col] !== 0) return
  // 填入数字
  state.playerGrid[row][col] = num
}

export function useGameStore() {
  return {
    state: readonly(state),
    newGame,
    selectCell,
    clearSelection,
    placeNumber,
  }
}
