import { reactive, ref } from 'vue'
import SudokuEngine from '../utils/sudokuEngine.js'

const DIFF_MULT = { easy: 1, medium: 1.5, hard: 2.5, expert: 4 }

function loadZoom() {
  try {
    const s = parseInt(localStorage.getItem('sudoku-zoom'))
    if (s >= 50 && s <= 150) return s
  } catch (e) { /* ignore */ }
  return 100
}

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
  autoMarkFeature: false,
  depletionFeature: false,
  mistakes: 0,
  errors: new Set(),
  elapsedSeconds: 0,
  isPaused: false,
  hintsRemaining: 3,
  hintCell: null,
  hintMessage: '',
  zoom: loadZoom(),
  isGameOver: false,
  gameWon: false,
  score: 0,
  streak: 0,
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
  clearSavedGame()
  const { puzzle, solution } = SudokuEngine.generatePuzzle(difficulty)
  state.puzzle = puzzle
  state.solution = solution
  state.playerGrid = puzzle.map(row => [...row])
  state.difficulty = difficulty
  state.selectedCell = null
  state.notes = initNotes()
  state.isNoteMode = false
  state.mistakes = 0
  state.errors.clear()
  state.isGameOver = false
  state.gameWon = false
  state.score = 0
  state.streak = 0
  state.elapsedSeconds = 0
  state.isPaused = false
  state.hintsRemaining = 3
  state.hintCell = null
  startTimer()
}

function selectCell(row, col) {
  if (state.isGameOver) return
  state.selectedCell = { row, col }
}

function checkWin() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (state.playerGrid[r][c] !== state.solution[r][c]) return false
    }
  }
  return true
}

function placeNumber(num) {
  if (state.isGameOver) return
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

  // 错误检测
  const errKey = `${row},${col}`
  if (state.solution[row][col] !== num) {
    state.errors.add(errKey)
    state.mistakes++
    state.streak = 0
    state.score = Math.max(0, state.score - 30)
    if (state.mistakes >= 3) {
      state.isGameOver = true
      state.gameWon = false
      stopTimer()
      saveGameHistory(false)
      clearSavedGame()
    }
  } else {
    state.errors.delete(errKey)
    state.streak++
    const sm = state.streak >= 5 ? 3 : state.streak >= 3 ? 2 : state.streak >= 2 ? 1.5 : 1
    const m = DIFF_MULT[state.difficulty] || 1
    state.score += Math.round(10 * sm * m)
    // 检查是否全部填完
    if (checkWin()) {
      state.isGameOver = true
      state.gameWon = true
      stopTimer()
      saveGameHistory(true)
      clearSavedGame()
    }
  }
  if (!state.isGameOver) saveGame()
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
  if (state.isGameOver) return
  if (!state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.puzzle[row][col] !== 0) return
  state.playerGrid[row][col] = 0
  // 擦除时清除错误标记
  state.errors.delete(`${row},${col}`)
  saveGame()
}

function toggleNoteMode() {
  if (state.isGameOver) return
  state.isNoteMode = !state.isNoteMode
  saveGame()
}

function autoCalcCell() {
  if (!state.selectedCell) return
  const { row, col } = state.selectedCell
  if (state.playerGrid[row][col] !== 0) return
  if (state.notes[row][col].size > 0) {
    state.notes[row][col].clear()
  } else {
    state.notes[row][col] = calcCandidates(row, col)
  }
}

function toggleAutoCalc(on) {
  state.isAutoCalc = on
  // 开启时自动计算功能可用，按钮可点击
}

function toggleAutoMark() {
  state.isAutoMark = !state.isAutoMark
  if (state.isAutoMark) {
    refreshAutoMark()
  } else {
    state.notes = initNotes()
  }
}

function setAutoMarkFeature(on) {
  state.autoMarkFeature = on
  if (!on && state.isAutoMark) {
    // 关闭功能时同时关闭标记
    state.isAutoMark = false
    state.notes = initNotes()
  }
}

function toggleDepletion() {
  state.depletionFeature = !state.depletionFeature
}

let timerInterval = null

function startTimer() {
  stopTimer()
  timerInterval = setInterval(() => {
    if (!state.isPaused) {
      state.elapsedSeconds++
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function togglePause() {
  state.isPaused = !state.isPaused
}

function setZoom(val) {
  state.zoom = Math.max(50, Math.min(150, val))
  try { localStorage.setItem('sudoku-zoom', String(val)) } catch (e) { /* ignore */ }
}

function getCandidates(r, c) {
  if (state.playerGrid[r][c] !== 0) return new Set()
  const p = new Set()
  for (let i = 0; i < 9; i++) {
    if (state.playerGrid[r][i] !== 0) p.add(state.playerGrid[r][i])
    if (state.playerGrid[i][c] !== 0) p.add(state.playerGrid[i][c])
  }
  const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3
  for (let rr = sr; rr < sr + 3; rr++)
    for (let cc = sc; cc < sc + 3; cc++)
      if (state.playerGrid[rr][cc] !== 0) p.add(state.playerGrid[rr][cc])
  const r2 = new Set()
  for (let n = 1; n <= 9; n++) if (!p.has(n)) r2.add(n)
  return r2
}

function findHint() {
  const fixed = state.puzzle

  // 1. 唯余法 — 只有一个候选数的空格
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (fixed[r][c] || state.playerGrid[r][c] !== 0) continue
    const cs = getCandidates(r, c)
    if (cs.size === 1) return { r, c, num: [...cs][0], method: 'naked' }
  }

  // 2. 隐唯法 — 行
  for (let r = 0; r < 9; r++) for (let n = 1; n <= 9; n++) {
    let ok = false; for (let c = 0; c < 9; c++) if (state.playerGrid[r][c] === n) { ok = true; break }
    if (ok) continue
    const ps = []
    for (let c = 0; c < 9; c++)
      if (!fixed[r][c] && state.playerGrid[r][c] === 0 && getCandidates(r, c).has(n)) ps.push(c)
    if (ps.length === 1) return { r, c: ps[0], num: n, method: 'hidden_row' }
  }

  // 3. 隐唯法 — 列
  for (let c = 0; c < 9; c++) for (let n = 1; n <= 9; n++) {
    let ok = false; for (let r = 0; r < 9; r++) if (state.playerGrid[r][c] === n) { ok = true; break }
    if (ok) continue
    const ps = []
    for (let r = 0; r < 9; r++)
      if (!fixed[r][c] && state.playerGrid[r][c] === 0 && getCandidates(r, c).has(n)) ps.push(r)
    if (ps.length === 1) return { r: ps[0], c, num: n, method: 'hidden_col' }
  }

  // 4. 隐唯法 — 宫
  for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) for (let n = 1; n <= 9; n++) {
    const sr = br * 3, sc = bc * 3
    let ok = false
    for (let rr = sr; rr < sr + 3 && !ok; rr++) for (let cc = sc; cc < sc + 3; cc++)
      if (state.playerGrid[rr][cc] === n) { ok = true; break }
    if (ok) continue
    const ps = []
    for (let rr = sr; rr < sr + 3; rr++) for (let cc = sc; cc < sc + 3; cc++)
      if (!fixed[rr][cc] && state.playerGrid[rr][cc] === 0 && getCandidates(rr, cc).has(n)) ps.push([rr, cc])
    if (ps.length === 1) return { r: ps[0][0], c: ps[0][1], num: n, method: 'hidden_box' }
  }

  // 5. 兜底 — 第一个空格
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
    if (!fixed[r][c] && state.playerGrid[r][c] === 0) return { r, c, num: state.solution[r][c], method: 'fallback' }

  return null
}

function useHint() {
  if (state.isGameOver) return
  if (state.hintsRemaining <= 0) return

  const hint = findHint()
  if (!hint) return

  const { r, c, num, method } = hint

  // 填入正确数字
  state.playerGrid[r][c] = num
  state.hintsRemaining--
  state.score = Math.max(0, state.score - 50)

  // 记录提示的格子（用于动画）
  state.hintCell = `${r},${c}`
  setTimeout(() => { state.hintCell = null }, 1200)

  // 清除同行/列/宫的该数字笔记
  clearNotesForNumber(num, r, c)
  saveGame()

  // 设置提示信息
  const methodMap = {
    naked: `唯余法：第 ${r + 1} 行第 ${c + 1} 列只有 ${num} 可以填`,
    hidden_row: `隐唯法：第 ${r + 1} 行中只有第 ${c + 1} 列可以填 ${num}`,
    hidden_col: `隐唯法：第 ${c + 1} 列中只有第 ${r + 1} 行可以填 ${num}`,
    hidden_box: `隐唯法：第 ${Math.floor(r / 3) * 3 + 1} 行第 ${Math.floor(c / 3) * 3 + 1} 格的宫中只有 (${r + 1},${c + 1}) 可以填 ${num}`,
    fallback: `第 ${r + 1} 行第 ${c + 1} 列应该填 ${num}`,
  }
  state.hintMessage = methodMap[method] || methodMap.fallback
  setTimeout(() => { state.hintMessage = '' }, 3000)
}

const SAVE_KEY = 'sudoku-saved-game'
const HISTORY_KEY = 'sudoku-history'

function saveGameHistory(won) {
  const fmt = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  const m = DIFF_MULT[state.difficulty] || 1
  const totalScore = won ? state.score : 0
  try {
    const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    h.unshift({
      date: new Date().toISOString(),
      difficulty: state.difficulty,
      score: totalScore,
      time: fmt(state.elapsedSeconds),
      seconds: state.elapsedSeconds,
      mistakes: state.mistakes,
      hints: 3 - state.hintsRemaining,
      won,
    })
    if (h.length > 50) h.length = 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
  } catch (e) { /* ignore */ }
}

function saveGame() {
  if (state.isGameOver) return
  const data = {
    puzzle: state.puzzle,
    solution: state.solution,
    playerGrid: state.playerGrid,
    notes: state.notes.map(r => r.map(s => [...s])),
    mistakes: state.mistakes,
    elapsedSeconds: state.elapsedSeconds,
    difficulty: state.difficulty,
    hintsRemaining: state.hintsRemaining,
    isNoteMode: state.isNoteMode,
    isAutoCalc: state.isAutoCalc,
    isAutoMark: state.isAutoMark,
    autoMarkFeature: state.autoMarkFeature,
    depletionFeature: state.depletionFeature,
    zoom: state.zoom,
  }
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)) } catch (e) { /* ignore */ }
}

function restoreGame(saved) {
  state.puzzle = saved.puzzle
  state.solution = saved.solution
  state.playerGrid = saved.playerGrid
  state.notes = saved.notes.map(r => r.map(a => new Set(a)))
  state.mistakes = saved.mistakes
  state.elapsedSeconds = saved.elapsedSeconds
  state.difficulty = saved.difficulty
  state.hintsRemaining = saved.hintsRemaining
  state.isNoteMode = saved.isNoteMode
  state.isAutoCalc = saved.isAutoCalc
  state.isAutoMark = saved.isAutoMark
  state.autoMarkFeature = saved.autoMarkFeature
  state.depletionFeature = saved.depletionFeature || false
  state.zoom = saved.zoom || 100
  state.errors.clear()
  state.selectedCell = null
  state.isPaused = false
  state.hintCell = null
  state.hintMessage = ''
  startTimer()
}

function hasSavedGame() {
  try {
    const r = localStorage.getItem(SAVE_KEY)
    if (!r) return false
    return JSON.parse(r) && true
  } catch (e) { return false }
}

function clearSavedGame() {
  try { localStorage.removeItem(SAVE_KEY) } catch (e) { /* ignore */ }
}

export function useGameStore() {
  return {
    state,
    newGame,
    selectCell,
    placeNumber,
    eraseCell,
    toggleNoteMode,
    autoCalcCell,
    toggleAutoCalc,
    toggleAutoMark,
    setAutoMarkFeature,
    toggleDepletion,
    startTimer,
    stopTimer,
    useHint,
    togglePause,
    setZoom,
    saveGame,
    saveGameHistory,
    hasSavedGame,
    restoreGame,
    clearSavedGame,
  }
}
