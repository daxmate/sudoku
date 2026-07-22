// ==================================================================
// 入口控制器 — state、DOM 引用、游戏流程、事件绑定、初始化
// ==================================================================

(function() {
const S = window.S;
const st = S.state;
const el = S.el;

// ==============================================================
// DOM 引用
// ==============================================================

el.board = document.getElementById('board');
el.timer = document.getElementById('timerDisplay');
el.mistakes = document.getElementById('mistakesCount');
el.scoreDisplay = document.getElementById('scoreDisplay');
el.scoreDetail = document.getElementById('scoreDetail');
el.notesToggle = document.getElementById('notesToggle');
el.autoMark = document.getElementById('autoMarkBtn');
el.markCell = document.getElementById('markCellBtn');
el.newGame = document.getElementById('newGameBtn');
el.hintBtn = document.getElementById('hintBtn');
el.hintCount = document.getElementById('hintCount');
el.leaderboardBtn = document.getElementById('leaderboardBtn');
el.themeBtn = document.getElementById('themeBtn');
el.lbOverlay = document.getElementById('lbOverlay');
el.lbList = document.getElementById('lbList');
el.lbClose = document.getElementById('lbClose');
el.lbFilters = document.getElementById('lbFilters');
el.overlay = document.getElementById('confirmOverlay');
el.confirmMsg = document.getElementById('confirmMsg');
el.confirmOk = document.getElementById('confirmOk');
el.confirmCancel = document.getElementById('confirmCancel');
el.infoBar = document.getElementById('infoBar');
el.diffBtns = document.querySelectorAll('.difficulty-wrap button');


// ==============================================================
// 状态
// ==============================================================

Object.assign(st, {
    puzzle: [], solution: [], userGrid: [], fixedCells: [],
    notes: [], userRemovedNotes: [],
    selectedRow: -1, selectedCol: -1,
    mistakes: 0, maxMistakes: 3,
    isGameOver: false, isCandidateEditMode: false, allNotesOn: false,
    timerSeconds: 0, timerInterval: null,
    difficulty: 'easy',
    score: 0, streak: 0, hintsUsed: 0, maxHints: 3,
});

// ==============================================================
// 基础工具
// ==============================================================

S.fmtTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

S.stopTimer = () => {
    if (st.timerInterval) { clearInterval(st.timerInterval); st.timerInterval = null; }
};

S.startTimer = () => {
    if (st.timerInterval) return;
    st.timerInterval = setInterval(() => {
        st.timerSeconds++;
        el.timer.textContent = S.fmtTime(st.timerSeconds);
    }, 1000);
};


// ==============================================================
// 游戏流程
// ==============================================================

const resetGame = (difficulty) => {
    S.stopTimer();
    Object.assign(st, {
        timerSeconds: 0, mistakes: 0, isGameOver: false,
        isCandidateEditMode: false, allNotesOn: false,
        selectedRow: -1, selectedCol: -1,
        score: 0, streak: 0, hintsUsed: 0,
    });
    el.timer.textContent = '00:00';
    el.mistakes.textContent = '0';
    el.notesToggle.classList.remove('active');
    el.autoMark.classList.remove('active');
    el.hintCount.textContent = st.maxHints;
    el.hintBtn.disabled = false;
    el.scoreDetail.style.display = 'none';
    S.updateScoreDisplay();
    S.clearSavedGame();

    const { puzzle, solution } = SudokuEngine.generatePuzzle(difficulty);
    st.puzzle = puzzle;
    st.solution = solution;
    st.userGrid = SudokuEngine.deepCopy(puzzle);
    st.fixedCells = puzzle.map(row => row.map(v => v !== 0));
    st.notes = puzzle.map(row => row.map(() => new Set()));
    st.userRemovedNotes = puzzle.map(row => row.map(() => new Set()));

    S.renderBoard();
    S.startTimer();
};

const checkWin = () => {
    const g = st.userGrid;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (g[r][c] === 0) return false;
    const solved = SudokuEngine.solve(g);
    if (!solved) return false;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (solved[r][c] !== g[r][c]) return false;
    return true;
};

const gameOver = (won = false) => {
    st.isGameOver = true;
    S.stopTimer();
    if (won) S.playVictorySound();
    const total = S.calcFinalScore();
    el.scoreDetail.innerHTML = S.buildScoreDetailHTML(total);
    el.scoreDetail.style.display = 'block';
    S.saveGameHistory(won, total);
    S.clearSavedGame();
    S.showOverlay(won ? '恭喜你完成数独！' : '游戏结束！错误已达上限。', { single: true });
};


// ==============================================================
// 填入数字
// ==============================================================

S.onCellClick = (r, c) => {
    if (st.isGameOver) return;
    st.selectedRow = r; st.selectedCol = c;
    S.renderBoard();
};

const notesPruneNumber = (num, row, col) => {
    if (st.isGameOver || num === 0) return;
    for (let i = 0; i < 9; i++) {
        if (st.userGrid[row][i] === 0) st.notes[row][i].delete(num);
        if (st.userGrid[i][col] === 0) st.notes[i][col].delete(num);
    }
    const sr = Math.floor(row / 3) * 3, sc = Math.floor(col / 3) * 3;
    for (let rr = sr; rr < sr + 3; rr++)
        for (let cc = sc; cc < sc + 3; cc++)
            if (st.userGrid[rr][cc] === 0) st.notes[rr][cc].delete(num);
};

const placeNumber = (num) => {
    if (st.isGameOver) return;
    const { selectedRow: r, selectedCol: c } = st;
    if (r < 0 || c < 0) return;
    if (st.fixedCells[r][c]) return;

    const g = st.userGrid;

    // 候选编辑模式
    if (st.isCandidateEditMode) {
        if (g[r][c] !== 0) return;
        const ns = st.notes[r][c];
        const rm = st.userRemovedNotes[r][c];
        if (num === 0) { ns.clear(); rm.clear(); }
        else if (ns.has(num)) { ns.delete(num); rm.add(num); }
        else { ns.add(num); rm.delete(num); }
        S.renderBoard();
        return;
    }

    if (num === 0) {
        if (g[r][c] !== 0) { g[r][c] = 0; st.notes[r][c].clear(); S.renderBoard(); }
        return;
    }

    if (g[r][c] === num) return;

    // 错误
    if (num !== st.solution[r][c]) {
        st.mistakes++;
        el.mistakes.textContent = st.mistakes;
        g[r][c] = num; st.notes[r][c].clear(); notesPruneNumber(num, r, c);
        S.renderBoard();
        S.playErrorSound();
        const cel = el.board.children[r * 9 + c];
        if (cel) cel.classList.add('shake');
        st.streak = 0;
        S.addScore(-30, r, c);
        if (st.mistakes >= st.maxMistakes) gameOver(false);
        return;
    }

    // 正确
    g[r][c] = num; st.notes[r][c].clear(); notesPruneNumber(num, r, c);
    S.renderBoard();
    S.playCorrectSound();
    const cel = el.board.children[r * 9 + c];
    if (cel) cel.classList.add('pop');
    st.streak++;
    const sm = st.streak >= 5 ? 3 : st.streak >= 3 ? 2 : st.streak >= 2 ? 1.5 : 1;
    S.addScore(Math.round(10 * sm), r, c);
    S.checkAndAnimateLineCompletion(r, c);
    if (checkWin()) gameOver(true);
};


// ==============================================================
// 提示
// ==============================================================

const giveHint = () => {
    if (st.isGameOver) return;
    const left = st.maxHints - st.hintsUsed;
    if (left <= 0) { S.showOverlay('提示次数已用完（最多 3 次）', { single: true }); return; }

    st.hintsUsed++;
    el.hintCount.textContent = left - 1;
    if (left - 1 <= 0) el.hintBtn.disabled = true;

    const hr = st.selectedRow >= 0 ? st.selectedRow : 0;
    const hc = st.selectedCol >= 0 ? st.selectedCol : 0;
    S.addScore(-50, hr, hc);

    const hint = S.findHint(st.userGrid, st.solution, st.fixedCells);
    if (!hint) { S.showInfo('所有格子都已正确！'); return; }

    const { r, c, num } = hint;
    st.userGrid[r][c] = num;
    st.notes[r][c].clear();
    notesPruneNumber(num, r, c);
    S.renderBoard();
    S.flashHintCell(r, c);
    S.checkAndAnimateLineCompletion(r, c);

    const methodMap = {
        naked: `唯余法：第 ${r + 1} 行第 ${c + 1} 列只有 ${num} 可以填`,
        hidden_row: `隐唯法：第 ${r + 1} 行中只有第 ${c + 1} 列可以填 ${num}`,
        hidden_col: `隐唯法：第 ${c + 1} 列中只有第 ${r + 1} 行可以填 ${num}`,
        hidden_box: `隐唯法：第 ${Math.floor(r / 3) * 3 + 1} 行第 ${Math.floor(c / 3) * 3 + 1} 格的宫中只有 (${r + 1},${c + 1}) 可以填 ${num}`,
    };
    S.showInfo(methodMap[hint.method] || `第 ${r + 1} 行第 ${c + 1} 列应该填 ${num}`);

    if (checkWin()) gameOver(true);
};


// ==============================================================
// 自动标记 & 单格备注
// ==============================================================

const autoMarkNotes = () => {
    if (st.isGameOver) return;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (st.userGrid[r][c] !== 0) { st.notes[r][c].clear(); st.userRemovedNotes[r][c].clear(); continue; }
        const p = new Set();
        for (let i = 0; i < 9; i++) {
            if (st.userGrid[r][i] !== 0) p.add(st.userGrid[r][i]);
            if (st.userGrid[i][c] !== 0) p.add(st.userGrid[i][c]);
        }
        const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
        for (let rr = sr; rr < sr + 3; rr++)
            for (let cc = sc; cc < sc + 3; cc++)
                if (st.userGrid[rr][cc] !== 0) p.add(st.userGrid[rr][cc]);
        const cs = new Set();
        for (let n = 1; n <= 9; n++) if (!p.has(n)) cs.add(n);
        st.userRemovedNotes[r][c].forEach(n => cs.delete(n));
        st.notes[r][c] = cs;
    }
};

const autoMarkCell = () => {
    if (st.isGameOver) return;
    const { selectedRow: r, selectedCol: c } = st;
    if (r < 0 || c < 0 || st.fixedCells[r][c] || st.userGrid[r][c] !== 0) return;
    SudokuEngine.calcCandidatesForCell(st.userGrid, r, c, st.notes, st.userRemovedNotes);
    S.renderBoard();
};


// ==============================================================
// 难度切换 / 键盘
// ==============================================================

S.setDifficulty = (diff) => {
    st.difficulty = diff;
    el.diffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === diff));
    resetGame(diff);
};

S.handleKeydown = (e) => {
    if (st.isGameOver) return;
    const k = e.key;
    if (k >= '1' && k <= '9') { e.preventDefault(); placeNumber(parseInt(k)); }
    else if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); placeNumber(0); }
    else if (k.startsWith('Arrow')) {
        e.preventDefault();
        let { selectedRow: r, selectedCol: c } = st;
        if (r < 0 || c < 0) { r = 0; c = 0; }
        else {
            if (k === 'ArrowUp') r = Math.max(0, r - 1);
            if (k === 'ArrowDown') r = Math.min(8, r + 1);
            if (k === 'ArrowLeft') c = Math.max(0, c - 1);
            if (k === 'ArrowRight') c = Math.min(8, c + 1);
        }
        st.selectedRow = r; st.selectedCol = c;
        S.renderBoard();
    }
};


// ==============================================================
// 初始化
// ==============================================================

const init = () => {
    document.querySelectorAll('.num-grid button[data-num]').forEach(b => {
        b.addEventListener('click', () => placeNumber(parseInt(b.dataset.num)));
    });
    document.querySelector('.erase-btn').addEventListener('click', () => placeNumber(0));

    el.autoMark.addEventListener('click', () => {
        st.allNotesOn = !st.allNotesOn;
        if (st.allNotesOn) autoMarkNotes();
        else for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { st.notes[r][c].clear(); st.userRemovedNotes[r][c].clear(); }
        el.autoMark.classList.toggle('active', st.allNotesOn);
        S.renderBoard();
    });

    el.markCell.addEventListener('click', autoMarkCell);
    el.notesToggle.addEventListener('click', () => {
        st.isCandidateEditMode = !st.isCandidateEditMode;
        el.notesToggle.classList.toggle('active', st.isCandidateEditMode);
    });

    el.newGame.addEventListener('click', () => {
        S.showOverlay('开始新游戏？当前进度将丢失。', { onOk: () => resetGame(st.difficulty) });
    });
    el.hintBtn.addEventListener('click', giveHint);
    el.leaderboardBtn.addEventListener('click', S.showLeaderboard);

    // 主题切换
    {
        const applyTheme = (dark) => {
            document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
            el.themeBtn.classList.toggle('dark', dark);
            try { localStorage.setItem('sudoku-theme', dark ? 'dark' : 'light'); } catch (e) {}
        };
        try {
            const saved = localStorage.getItem('sudoku-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(saved ? saved === 'dark' : prefersDark);
        } catch (e) {}
        el.themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            applyTheme(!isDark);
        });
    }
    el.lbClose.addEventListener('click', () => el.lbOverlay.classList.remove('show'));
    el.lbOverlay.addEventListener('click', (e) => { if (e.target === el.lbOverlay) el.lbOverlay.classList.remove('show'); });
    el.lbFilters.addEventListener('click', (e) => {
        const b = e.target.closest('.lb-filter');
        if (b) S.renderLeaderboard(b.dataset.filter);
    });

    el.diffBtns.forEach(b => {
        b.addEventListener('click', () => { if (b.dataset.diff !== st.difficulty) S.setDifficulty(b.dataset.diff); });
    });

    // 缩放
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomLabel = document.getElementById('zoomLabel');
    try { const s = parseInt(localStorage.getItem('sudoku-zoom')); if (s >= 70 && s <= 130) zoomSlider.value = s; } catch (e) {}
    const applyZoom = (v) => { document.documentElement.style.setProperty('--ui-scale', v / 100); zoomLabel.textContent = v + '%'; try { localStorage.setItem('sudoku-zoom', v); } catch (e) {} };
    zoomSlider.addEventListener('input', () => { zoomLabel.textContent = zoomSlider.value + '%'; });
    zoomSlider.addEventListener('change', () => applyZoom(parseInt(zoomSlider.value)));
    applyZoom(parseInt(zoomSlider.value));

    document.addEventListener('keydown', S.handleKeydown);
    window.addEventListener('beforeunload', S.saveGame);

    if (S.hasSavedGame()) {
        S.showOverlay('检测到未完成的数独，是否继续？', {
            onOk: () => { try { const r = localStorage.getItem('sudoku-saved-game'); if (r) S.restoreGame(JSON.parse(r)); else resetGame('easy'); } catch (e) { resetGame('easy'); } },
            onCancel: () => resetGame('easy'),
        });
    } else {
        resetGame('easy');
    }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
