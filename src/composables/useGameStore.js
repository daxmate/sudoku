import { reactive, readonly } from 'vue'
import SudokuEngine from '../utils/sudokuEngine.js'

const state = reactive({
  puzzle: [],
  solution: [],
  playerGrid: [],
  difficulty: 'medium',
  selectedCell: null, // { row, col } 或 null
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

export function useGameStore() {
  return {
    state: readonly(state),
    newGame,
    selectCell,
    clearSelection,
  }
}
