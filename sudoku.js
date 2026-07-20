// ============================================================
// 1. 核心引擎：生成、求解、验证
// ============================================================

const SudokuEngine = (() => {
    // ---------- 工具 ----------
    const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const deepCopy = (grid) => grid.map(row => [...row]);

    // ---------- 验证 ----------
    const isValidPlacement = (grid, row, col, num) => {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) return false;
            if (grid[i][col] === num) return false;
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (grid[r][c] === num) return false;
            }
        }
        return true;
    };

    // ---------- 求解 (回溯) ----------
    const solve = (grid) => {
        const board = deepCopy(grid);
        const solver = (b) => {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (b[r][c] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isValidPlacement(b, r, c, num)) {
                                b[r][c] = num;
                                if (solver(b)) return true;
                                b[r][c] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };
        if (solver(board)) return board;
        return null;
    };

    // ---------- 生成完整盘面 ----------
    const generateComplete = () => {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));
        const fill = (b) => {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (b[r][c] === 0) {
                        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                        for (const num of nums) {
                            if (isValidPlacement(b, r, c, num)) {
                                b[r][c] = num;
                                if (fill(b)) return true;
                                b[r][c] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };
        fill(board);
        return board;
    };

    // ---------- 挖洞生成谜题 (保证唯一解) ----------
    const generatePuzzle = (difficulty) => {
        const blanksMap = {
            easy: 32,
            medium: 40,
            hard: 48,
            expert: 54,
        };
        const targetBlanks = blanksMap[difficulty] || 40;

        const full = generateComplete();
        const puzzle = deepCopy(full);
        const positions = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                positions.push([r, c]);
            }
        }
        shuffle(positions);

        let removed = 0;
        for (const [r, c] of positions) {
            if (removed >= targetBlanks) break;
            const backup = puzzle[r][c];
            puzzle[r][c] = 0;

            const sol1 = solve(puzzle);
            if (!sol1) {
                puzzle[r][c] = backup;
                continue;
            }
            let unique = true;
            for (let testNum = 1; testNum <= 9; testNum++) {
                if (testNum === backup) continue;
                if (isValidPlacement(puzzle, r, c, testNum)) {
                    puzzle[r][c] = testNum;
                    const sol2 = solve(puzzle);
                    puzzle[r][c] = 0;
                    if (sol2) {
                        unique = false;
                        break;
                    }
                }
            }
            if (!unique) {
                puzzle[r][c] = backup;
            } else {
                removed++;
            }
        }
        return { puzzle, solution: full };
    };

    return {
        generatePuzzle,
        solve,
        isValidPlacement,
        deepCopy,
    };
})();


// ============================================================
// 2. 游戏 UI 控制器
// ============================================================

(() => {
    // ---------- DOM 引用 ----------
    const boardEl = document.getElementById('board');
    const timerDisplay = document.getElementById('timerDisplay');
    const mistakesDisplay = document.getElementById('mistakesCount');
    const notesToggleBtn = document.getElementById('notesToggle');
    const newGameBtn = document.getElementById('newGameBtn');
    const hintBtn = document.getElementById('hintBtn');
    const solveBtn = document.getElementById('solveBtn');
    const diffButtons = document.querySelectorAll('.difficulty-wrap button');

    // ---------- 游戏状态 ----------
    let state = {
        puzzle: [],
        solution: [],
        userGrid: [],
        fixedCells: [],
        notes: [],
        selectedRow: -1,
        selectedCol: -1,
        mistakes: 0,
        maxMistakes: 3,
        isGameOver: false,
        isNotesMode: false,
        timerSeconds: 0,
        timerInterval: null,
        difficulty: 'easy',
    };

    // ---------- 辅助函数 ----------
    const formatTime = (sec) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const stopTimer = () => {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    };

    const startTimer = () => {
        if (state.timerInterval) return;
        state.timerInterval = setInterval(() => {
            state.timerSeconds++;
            timerDisplay.textContent = formatTime(state.timerSeconds);
        }, 1000);
    };

    // ---------- 重置游戏 ----------
    const resetGame = (difficulty) => {
        stopTimer();
        state.timerSeconds = 0;
        timerDisplay.textContent = '00:00';
        state.mistakes = 0;
        mistakesDisplay.textContent = '0';
        state.isGameOver = false;
        state.selectedRow = -1;
        state.selectedCol = -1;
        state.isNotesMode = false;
        notesToggleBtn.classList.remove('active');

        const { puzzle, solution } = SudokuEngine.generatePuzzle(difficulty);
        state.puzzle = puzzle;
        state.solution = solution;
        state.userGrid = SudokuEngine.deepCopy(puzzle);
        state.fixedCells = puzzle.map(row => row.map(v => v !== 0));
        state.notes = puzzle.map(row => row.map(() => new Set()));

        renderBoard();
        startTimer();
    };

    // ---------- 渲染棋盘 ----------
    const renderBoard = () => {
        boardEl.innerHTML = '';
        const grid = state.userGrid;
        const fixed = state.fixedCells;
        const notes = state.notes;
        const selR = state.selectedRow;
        const selC = state.selectedCol;

        let selectedNum = null;
        if (selR >= 0 && selC >= 0 && grid[selR][selC] !== 0) {
            selectedNum = grid[selR][selC];
        }

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const val = grid[r][c];
                const isFixed = fixed[r][c];

                if (isFixed) {
                    cell.classList.add('fixed');
                } else if (val !== 0) {
                    cell.classList.add('user-input');
                }

                if (r === selR && c === selC) {
                    cell.classList.add('selected');
                }

                if ((r === selR || c === selC) && !(r === selR && c === selC)) {
                    cell.classList.add('highlighted');
                }

                if (selectedNum !== null && val === selectedNum && !(r === selR && c === selC)) {
                    cell.classList.add('same-number');
                }

                if (val !== 0) {
                    cell.textContent = val;
                } else if (notes[r][c] && notes[r][c].size > 0) {
                    const notesContainer = document.createElement('div');
                    notesContainer.className = 'notes-container';
                    const sorted = Array.from(notes[r][c]).sort((a, b) => a - b);
                    for (let n = 1; n <= 9; n++) {
                        const span = document.createElement('span');
                        span.textContent = sorted.includes(n) ? n : '';
                        notesContainer.appendChild(span);
                    }
                    cell.appendChild(notesContainer);
                }

                cell.addEventListener('click', () => onCellClick(r, c));
                boardEl.appendChild(cell);
            }
        }

        markErrors();
    };

    // ---------- 标记错误 ----------
    const markErrors = () => {
        const cells = boardEl.querySelectorAll('.cell');
        const grid = state.userGrid;
        const fixed = state.fixedCells;
        cells.forEach(el => el.classList.remove('error'));

        const hasError = (r, c) => {
            const val = grid[r][c];
            if (val === 0) return false;
            for (let i = 0; i < 9; i++) {
                if (i === c) continue;
                if (grid[r][i] === val) return true;
            }
            for (let i = 0; i < 9; i++) {
                if (i === r) continue;
                if (grid[i][c] === val) return true;
            }
            const sr = Math.floor(r / 3) * 3;
            const sc = Math.floor(c / 3) * 3;
            for (let rr = sr; rr < sr + 3; rr++) {
                for (let cc = sc; cc < sc + 3; cc++) {
                    if (rr === r && cc === c) continue;
                    if (grid[rr][cc] === val) return true;
                }
            }
            return false;
        };

        cells.forEach(el => {
            const r = parseInt(el.dataset.row);
            const c = parseInt(el.dataset.col);
            if (!fixed[r][c] && grid[r][c] !== 0 && hasError(r, c)) {
                el.classList.add('error');
            }
        });
    };

    // ---------- 检查胜利 ----------
    const checkWin = () => {
        const grid = state.userGrid;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) return false;
            }
        }
        const solved = SudokuEngine.solve(grid);
        if (!solved) return false;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (solved[r][c] !== grid[r][c]) return false;
            }
        }
        return true;
    };

    // ---------- 游戏结束处理 ----------
    const gameOver = (won = false) => {
        state.isGameOver = true;
        stopTimer();
        if (won) {
            alert('🎉 恭喜你完成数独！太棒啦！');
        } else {
            alert('💔 游戏结束！错误已达上限。点击「新游戏」重新开始。');
        }
    };

    // ---------- 单元格点击 ----------
    const onCellClick = (row, col) => {
        if (state.isGameOver) return;
        state.selectedRow = row;
        state.selectedCol = col;
        renderBoard();
    };

    // ---------- 填入数字 ----------
    const placeNumber = (num) => {
        if (state.isGameOver) return;
        const { selectedRow: r, selectedCol: c } = state;
        if (r < 0 || c < 0) return;
        if (state.fixedCells[r][c]) return;

        const grid = state.userGrid;

        if (state.isNotesMode) {
            const noteSet = state.notes[r][c];
            if (num === 0) {
                noteSet.clear();
            } else {
                if (noteSet.has(num)) {
                    noteSet.delete(num);
                } else {
                    if (grid[r][c] !== 0) return;
                    noteSet.add(num);
                }
            }
            renderBoard();
            return;
        }

        if (num === 0) {
            if (grid[r][c] !== 0) {
                grid[r][c] = 0;
                state.notes[r][c].clear();
                renderBoard();
            }
            return;
        }

        if (grid[r][c] === num) return;

        if (num !== state.solution[r][c]) {
            state.mistakes++;
            mistakesDisplay.textContent = state.mistakes;
            grid[r][c] = num;
            state.notes[r][c].clear();
            renderBoard();
            if (state.mistakes >= state.maxMistakes) {
                gameOver(false);
            }
            return;
        }

        grid[r][c] = num;
        state.notes[r][c].clear();
        renderBoard();

        if (checkWin()) {
            gameOver(true);
        }
    };

    // ---------- 提示 ----------
    const giveHint = () => {
        if (state.isGameOver) return;
        const grid = state.userGrid;
        const solution = state.solution;
        const fixed = state.fixedCells;
        let candidates = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!fixed[r][c] && grid[r][c] !== solution[r][c]) {
                    candidates.push([r, c]);
                }
            }
        }
        if (candidates.length === 0) {
            alert('所有格子都已正确！');
            return;
        }
        const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
        grid[r][c] = solution[r][c];
        state.notes[r][c].clear();
        renderBoard();
        const cells = boardEl.querySelectorAll('.cell');
        cells.forEach(el => {
            if (parseInt(el.dataset.row) === r && parseInt(el.dataset.col) === c) {
                el.classList.add('hint-glow');
                setTimeout(() => el.classList.remove('hint-glow'), 1200);
            }
        });

        if (checkWin()) {
            gameOver(true);
        }
    };

    // ---------- 一键解答 ----------
    const solveBoard = () => {
        if (state.isGameOver) return;
        if (confirm('将自动填入所有正确答案，确定吗？')) {
            const solution = state.solution;
            const grid = state.userGrid;
            const fixed = state.fixedCells;
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (!fixed[r][c]) {
                        grid[r][c] = solution[r][c];
                        state.notes[r][c].clear();
                    }
                }
            }
            renderBoard();
            if (checkWin()) {
                gameOver(true);
            }
        }
    };

    // ---------- 切换难度 ----------
    const setDifficulty = (diff) => {
        state.difficulty = diff;
        diffButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
        resetGame(diff);
    };

    // ---------- 键盘支持 ----------
    const handleKeydown = (e) => {
        if (state.isGameOver) return;
        const key = e.key;
        if (key >= '1' && key <= '9') {
            e.preventDefault();
            placeNumber(parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            e.preventDefault();
            placeNumber(0);
        } else if (key === 'n' || key === 'N') {
            e.preventDefault();
            state.isNotesMode = !state.isNotesMode;
            notesToggleBtn.classList.toggle('active', state.isNotesMode);
        } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            e.preventDefault();
            let { selectedRow: r, selectedCol: c } = state;
            if (r < 0 || c < 0) {
                r = 0;
                c = 0;
            } else {
                if (key === 'ArrowUp') r = Math.max(0, r - 1);
                if (key === 'ArrowDown') r = Math.min(8, r + 1);
                if (key === 'ArrowLeft') c = Math.max(0, c - 1);
                if (key === 'ArrowRight') c = Math.min(8, c + 1);
            }
            state.selectedRow = r;
            state.selectedCol = c;
            renderBoard();
        }
    };

    // ---------- 初始化 ----------
    const init = () => {
        document.querySelectorAll('.num-pad button[data-num]').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.dataset.num);
                placeNumber(num);
            });
        });

        notesToggleBtn.addEventListener('click', () => {
            state.isNotesMode = !state.isNotesMode;
            notesToggleBtn.classList.toggle('active', state.isNotesMode);
        });

        newGameBtn.addEventListener('click', () => {
            if (confirm('开始新游戏？当前进度将丢失。')) {
                resetGame(state.difficulty);
            }
        });

        hintBtn.addEventListener('click', giveHint);
        solveBtn.addEventListener('click', solveBoard);

        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.dataset.diff;
                if (diff !== state.difficulty) {
                    setDifficulty(diff);
                }
            });
        });

        document.addEventListener('keydown', handleKeydown);

        resetGame('easy');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
