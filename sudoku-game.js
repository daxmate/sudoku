

// ==================================================================
// 第二部分：游戏 UI 控制器
// ==================================================================
// 所有界面交互、事件绑定、DOM 操作都在这里。
// 游戏状态统一保存在 state 对象中，方便追踪和调试。
// ==================================================================

(() => {
    // ==============================================================
    // DOM 元素引用 — 一次性获取，避免重复查询
    // ==============================================================

    const boardEl = document.getElementById('board');           // 棋盘容器
    const timerDisplay = document.getElementById('timerDisplay'); // 计时器文字
    const mistakesDisplay = document.getElementById('mistakesCount');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreDetail = document.getElementById('scoreDetail');
    const notesToggleBtn = document.getElementById('notesToggle'); // 候选编辑按钮
    const autoMarkBtn = document.getElementById('autoMarkBtn'); // 全部标记按钮
    const markCellBtn = document.getElementById('markCellBtn'); // 单格备注按钮
    const newGameBtn = document.getElementById('newGameBtn');
    const hintBtn = document.getElementById('hintBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const lbOverlay = document.getElementById('lbOverlay');
    const lbList = document.getElementById('lbList');
    const lbClose = document.getElementById('lbClose');
    const lbFilters = document.getElementById('lbFilters');
    const hintCount = document.getElementById('hintCount');

    // 自定义弹窗
    const confirmOverlay = document.getElementById('confirmOverlay');
    const confirmMsg = document.getElementById('confirmMsg');
    const confirmOk = document.getElementById('confirmOk');
    const confirmCancel = document.getElementById('confirmCancel');

    const hideOverlay = () => {
        confirmOverlay.classList.remove('show');
        confirmOk.textContent = '确认';
        confirmCancel.style.display = '';
    };

    /** 底部信息栏（非阻塞提示） */
    let _infoTimer = null;
    const showInfo = (msg) => {
        if (_infoTimer) clearTimeout(_infoTimer);
        infoBar.textContent = msg;
        infoBar.classList.add('show');
        _infoTimer = setTimeout(() => infoBar.classList.remove('show'), 3000);
    };

    const showOverlay = (msg, opts = {}) => {
        confirmMsg.innerHTML = msg;
        if (opts.single) {
            confirmOk.textContent = '确定';
            confirmCancel.style.display = 'none';
        }
        confirmOverlay.classList.add('show');
        const cleanup = () => {
            hideOverlay();
            confirmOk.removeEventListener('click', fire);
            if (!opts.single) {
                confirmCancel.removeEventListener('click', cleanup);
                confirmOverlay.removeEventListener('click', onBgClick);
            }
        };
        const fire = () => { cleanup(); if (opts.onOk) opts.onOk(); };
        const onBgClick = (e) => {
            if (e.target === confirmOverlay) cleanup();
        };
        confirmOk.addEventListener('click', fire);
        if (!opts.single) {
            confirmCancel.addEventListener('click', cleanup);
            confirmOverlay.addEventListener('click', onBgClick);
        }
    };
    const diffButtons = document.querySelectorAll('.difficulty-wrap button'); // 难度按钮列表


    // ==============================================================
    // 游戏状态 — 所有可变数据集中管理
    // ==============================================================
    //
    // 字段说明：
    //   puzzle[][]     — 初始谜题（0=空格），不会改变
    //   solution[][]   — 完整正确答案
    //   userGrid[][]   — 用户当前填写的内容，动态变化
    //   fixedCells[][] — true=初始给定的数字（不可修改）
    //   notes[][]      — 每个格子的笔记（Set 存的候选数字）
    //   userRemovedNotes[][] — 用户手动移除的候选（Set），自动标记时不再加入
    //   selectedRow/Col — 当前选中的格子坐标，-1 表示未选中
    //   mistakes       — 已发生的错误次数
    //   maxMistakes    — 允许的最大错误次数（可以改成 5 或 10）
    //   isGameOver     — 游戏是否已结束
    //   timerSeconds   — 已用秒数
    //   timerInterval  — setInterval 的句柄，用于停止计时
    //   difficulty     — 当前难度
    // ==============================================================

    let state = {
        puzzle: [],
        solution: [],
        userGrid: [],
        fixedCells: [],
        notes: [],
        userRemovedNotes: [],
        selectedRow: -1,
        selectedCol: -1,
        mistakes: 0,
        maxMistakes: 3,           // ← 想改错误上限，改这里
        isGameOver: false,
        isCandidateEditMode: false,
        allNotesOn: false,
        timerSeconds: 0,
        timerInterval: null,
        difficulty: 'easy',
        score: 0,
        streak: 0,
        hintsUsed: 0,
        maxHints: 3,
    };


    // ==============================================================
    // 辅助函数
    // ==============================================================

    /**
     * 将秒数格式化为 MM:SS
     * @param {number} sec — 秒数
     * @returns {string} — 如 "05:23"
     */
    const formatTime = (sec) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    /** 停止计时器 */
    const stopTimer = () => {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    };

    /** 启动计时器（如果已经启动则不做任何事） */
    const startTimer = () => {
        if (state.timerInterval) return;
        state.timerInterval = setInterval(() => {
            state.timerSeconds++;
            timerDisplay.textContent = formatTime(state.timerSeconds);
        }, 1000);
    };


    // ==============================================================
    // 重置游戏
    // ==============================================================

    /**
     * 开始一局新游戏
     * 1. 停止计时器，重置所有计数
     * 2. 调用 SudokuEngine 生成谜题
     * 3. 初始化状态
     * 4. 重新渲染棋盘并启动计时
     *
     * @param {string} difficulty — 难度等级
     */
    const resetGame = (difficulty) => {
        // 重置计时和计数
        stopTimer();
        state.timerSeconds = 0;
        timerDisplay.textContent = '00:00';
        state.mistakes = 0;
        mistakesDisplay.textContent = '0';
        state.isGameOver = false;
        state.isCandidateEditMode = false;
        notesToggleBtn.classList.remove('active');
        state.allNotesOn = false;
        autoMarkBtn.classList.remove('active');
        state.selectedRow = -1;
        state.selectedCol = -1;
        state.score = 0;
        state.streak = 0;
        state.hintsUsed = 0;
        hintCount.textContent = state.maxHints;
        hintBtn.disabled = false;
        updateScoreDisplay();
        scoreDetail.style.display = 'none';

        // 生成谜题
        const { puzzle, solution } = SudokuEngine.generatePuzzle(difficulty);
        state.puzzle = puzzle;
        state.solution = solution;
        state.userGrid = SudokuEngine.deepCopy(puzzle);              // 用户盘面以谜题为起点
        state.fixedCells = puzzle.map(row => row.map(v => v !== 0)); // 非 0 的就是固定格
        state.notes = puzzle.map(row => row.map(() => new Set()));   // 每个格子一个 Set 存笔记
        state.userRemovedNotes = puzzle.map(row => row.map(() => new Set()));  // 追踪用户手动移除的候选

        renderBoard();    // 重新绘制棋盘
        startTimer();     // 开始计时
    };


    // ==============================================================
    // 渲染棋盘
    // ==============================================================

    /**
     * 根据 state 中的 userGrid、notes、selectedRow/Col 等信息，
     * 重新生成整个棋盘 DOM。
     *
     * 每次 state 变化（选中格、填入数字、一键标记）都调用此函数。
     * 性能上没问题，因为 81 个格子很少。
     */
    const renderBoard = () => {
        boardEl.innerHTML = '';  // 清空棋盘重新创建

        const grid = state.userGrid;
        const fixed = state.fixedCells;
        const notes = state.notes;
        const selR = state.selectedRow;
        const selC = state.selectedCol;

        // 如果选中格有数字，记录它用于高亮所有相同数字
        let selectedNum = null;
        if (selR >= 0 && selC >= 0 && grid[selR][selC] !== 0) {
            selectedNum = grid[selR][selC];
        }

        // 遍历 81 个格子
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;  // 存坐标，方便事件处理
                cell.dataset.col = c;

                const val = grid[r][c];
                const isFixed = fixed[r][c];

                // --- 样式类 ---

                if (isFixed) {
                    cell.classList.add('fixed');         // 初始给定数字
                } else if (val !== 0) {
                    cell.classList.add('user-input');     // 用户填入
                }

                // 当前选中的格子
                if (r === selR && c === selC) {
                    cell.classList.add('selected');
                }

                // 同行/同列/同宫高亮
                const sameBlock = Math.floor(r / 3) === Math.floor(selR / 3) && Math.floor(c / 3) === Math.floor(selC / 3);
                if ((r === selR || c === selC || sameBlock) && !(r === selR && c === selC)) {
                    cell.classList.add('highlighted');
                }

                // 与选中数字相同的其他格高亮（蓝色）
                if (selectedNum !== null && val === selectedNum && !(r === selR && c === selC)) {
                    cell.classList.add('same-number');
                }

                // --- 内容 ---

                if (val !== 0) {
                    // 有数字 → 直接显示
                    cell.textContent = val;
                } else if (notes[r][c] && notes[r][c].size > 0) {
                    // 没有数字但有笔记 → 渲染 3×3 笔记网格
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
                // 既无数字也无笔记 → 空单元格，不填充内容

                // 点击事件
                cell.addEventListener('click', () => onCellClick(r, c));

                boardEl.appendChild(cell);
            }
        }

        // 最后统一标记错误（红色高亮冲突的格子）
        markErrors();
        updateNumPadState();
    };


    // ==============================================================
    // 标记错误
    // ==============================================================

    /**
     * 遍历所有非固定格，检测行/列/宫冲突，给冲突格加上 error 样式
     * 每次渲染时调用
     */
    const markErrors = () => {
        const cells = boardEl.querySelectorAll('.cell');
        const grid = state.userGrid;
        const fixed = state.fixedCells;

        // 清除之前的错误标记
        cells.forEach(el => el.classList.remove('error'));

        /**
         * 检查 (r,c) 的数字是否正确
         * 非固定格且数字与答案不符即为错误
         */
        const hasError = (r, c) => {
            if (fixed[r][c]) return false;
            const val = grid[r][c];
            if (val === 0) return false;
            return val !== state.solution[r][c];
        };

        cells.forEach(el => {
            const r = parseInt(el.dataset.row);
            const c = parseInt(el.dataset.col);
            if (!fixed[r][c] && grid[r][c] !== 0 && hasError(r, c)) {
                el.classList.add('error');
            }
        });
    };

    /**
     * 统计每个数字在棋盘上的出现次数，耗尽时禁用数字按钮
     */
    const updateNumPadState = () => {
        const counts = Array(10).fill(0);
        const grid = state.userGrid;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const v = grid[r][c];
                if (v > 0) counts[v]++;
            }
        }
        document.querySelectorAll('.num-grid button[data-num]').forEach(btn => {
            const num = parseInt(btn.dataset.num);
            if (num === 0) return; // 擦除按钮不处理
            if (counts[num] >= 9) {
                btn.disabled = true;
                btn.classList.add('depleted');
            } else {
                btn.disabled = false;
                btn.classList.remove('depleted');
            }
        });
    };


    // ==============================================================
    // 胜利检测
    // ==============================================================

    /**
     * 检查玩家是否已完成所有格子且全部正确
     * 条件：
     *   1. 没有空格
     *   2. 调用求解器验证整个盘面是正确的
     */
    const checkWin = () => {
        const grid = state.userGrid;

        // 检查是否有空格
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) return false;
            }
        }

        // 用求解器验证正确性
        const solved = SudokuEngine.solve(grid);
        if (!solved) return false;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (solved[r][c] !== grid[r][c]) return false;
            }
        }
        return true;
    };


    // ==============================================================
    // 游戏结束
    // ==============================================================

    /**
     * 游戏结束处理：停止计时，弹出提示
     * @param {boolean} won — true=玩家赢了，false=错误超限
     */
    const gameOver = (won = false) => {
        state.isGameOver = true;
        stopTimer();

        if (won) playVictorySound();

        // 构建积分明细
        const mult = DIFF_MULT[state.difficulty] || 1;
        const base = state.score * mult;
        const cBonus = 100 * mult;
        const nhBonus = state.hintsUsed === 0 ? 200 * mult : 0;
        const neBonus = state.mistakes === 0 && won ? 150 * mult : 0;
        const tBonus = won ? Math.max(0, Math.round((1800 - state.timerSeconds) * 0.5 * mult)) : 0;
        const total = Math.round(base + cBonus + nhBonus + neBonus + tBonus);

        const fmt = (n) => `${n > 0 ? '+' : ''}${Math.round(n)}`;
        const dLabel = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }[state.difficulty];

        let html = `
            <div class="sd-row"><span class="sd-label">难度</span><span class="sd-val">${dLabel} (×${mult})</span></div>
            <div class="sd-row"><span class="sd-label">基础分</span><span class="sd-val">${fmt(base)}</span></div>
            <div class="sd-row"><span class="sd-label">通关奖励</span><span class="sd-val">${fmt(cBonus)}</span></div>`;
        if (nhBonus) html += `<div class="sd-row"><span class="sd-label">无提示奖励</span><span class="sd-val">${fmt(nhBonus)}</span></div>`;
        if (neBonus) html += `<div class="sd-row"><span class="sd-label">无错误奖励</span><span class="sd-val">${fmt(neBonus)}</span></div>`;
        if (tBonus)  html += `<div class="sd-row"><span class="sd-label">时间奖励</span><span class="sd-val">${fmt(tBonus)}</span></div>`;
        html += `
            <div class="sd-row"><span class="sd-label">用时</span><span class="sd-val">${formatTime(state.timerSeconds)}</span></div>
            <div class="sd-row"><span class="sd-label">错误</span><span class="sd-val">${state.mistakes}</span></div>
            <div class="sd-row"><span class="sd-label">提示</span><span class="sd-val">${state.hintsUsed}</span></div>
            <div class="sd-row sd-total"><span class="sd-label">🏆 总分</span><span class="sd-val">${total}</span></div>`;

        scoreDetail.innerHTML = html;
        scoreDetail.style.display = 'block';

        // 保存历史
        try {
            const h = JSON.parse(localStorage.getItem('sudoku-history') || '[]');
            h.unshift({ date: new Date().toISOString(), difficulty: state.difficulty, score: total,
                time: state.timerSeconds, mistakes: state.mistakes, hints: state.hintsUsed, won });
            if (h.length > 50) h.length = 50;
            localStorage.setItem('sudoku-history', JSON.stringify(h));
        } catch (e) {}

        const msg = won ? '🎉 恭喜你完成数独！' : '💔 游戏结束！错误已达上限。';
        showOverlay(msg, { single: true });
    };

    // ==============================================================
    // 排行榜
    // ==============================================================

    const diffLabel = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' };

    const renderLeaderboard = (filter = 'all') => {
        try {
            const history = JSON.parse(localStorage.getItem('sudoku-history') || '[]');
            const filtered = filter === 'all' ? history : history.filter(e => e.difficulty === filter);

            // 更新筛选按钮状态
            lbFilters.querySelectorAll('.lb-filter').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });

            if (filtered.length === 0) {
                lbList.innerHTML = '<p class="lb-empty">暂无游戏记录</p>';
                return;
            }

            // 按积分降序排列
            const sorted = [...filtered].sort((a, b) => b.score - a.score);

            const fmtTime = (s) => {
                const m = String(Math.floor(s / 60)).padStart(2, '0');
                const sec = String(s % 60).padStart(2, '0');
                return `${m}:${sec}`;
            };

            const fmtDate = (iso) => {
                const d = new Date(iso);
                return `${d.getMonth() + 1}/${d.getDate()}`;
            };

            let html = '';
            sorted.forEach((entry, i) => {
                const rank = i + 1;
                const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
                html += `<div class="lb-entry">
                    <span class="lb-rank ${rankClass}">${rank}</span>
                    <div class="lb-info">
                        <span class="lb-score ${rankClass}">${entry.score}</span>
                        <span class="lb-meta"><span class="lb-diff">${diffLabel[entry.difficulty] || entry.difficulty}</span>${fmtDate(entry.date)} · ${fmtTime(entry.time)}</span>
                    </div>
                    <span class="lb-time">${entry.won ? '✅' : '❌'}</span>
                </div>`;
            });

            lbList.innerHTML = html;
        } catch (e) {
            lbList.innerHTML = '<p class="lb-empty">加载失败</p>';
        }
    };

    /** 打开排行榜 */
    const showLeaderboard = () => {
        renderLeaderboard('all');
        lbOverlay.classList.add('show');
    };

    // ==============================================================
    // 事件处理 — 点击格子
    // ==============================================================

    /**
     * 点击格子时更新选中位置，重新渲染
     */
    const onCellClick = (row, col) => {
        if (state.isGameOver) return;
        state.selectedRow = row;
        state.selectedCol = col;
        renderBoard();
    };


    // ==============================================================
    // 事件处理 — 填入数字
    // ==============================================================

    /**
     * 将数字填入当前选中的格子
     *
     * 逻辑分支：
     *   - 数字=0     → 擦除当前格
     *   - 数字与答案不一致 → 计一次错误（但仍显示填的数字）
     *   - 数字正确   → 填入，检查胜利
     *
     * @param {number} num — 1-9 填入，0 擦除
     */
    const placeNumber = (num) => {
        if (state.isGameOver) return;

        const { selectedRow: r, selectedCol: c } = state;
        if (r < 0 || c < 0) return;          // 没有选中格子
        if (state.fixedCells[r][c]) return;   // 固定格不能修改

        const grid = state.userGrid;

        // ---- 候选编辑模式 ----
        if (state.isCandidateEditMode) {
            if (grid[r][c] !== 0) return;  // 有数字的格子不可编辑候选

            const noteSet = state.notes[r][c];
            const removedSet = state.userRemovedNotes[r][c];
            if (num === 0) {
                noteSet.clear();      // 擦除 → 清空笔记
                removedSet.clear();    // 清除追踪记录
            } else {
                if (noteSet.has(num)) {
                    noteSet.delete(num);       // 移除候选
                    removedSet.add(num);       // 记住用户移除了它
                } else {
                    noteSet.add(num);          // 添加候选
                    removedSet.delete(num);    // 用户手动加回来了，解除移除标记
                }
            }
            renderBoard();
            return;
        }

        // ---- 擦除 ----
        if (num === 0) {
            if (grid[r][c] !== 0) {
                // 擦除前记住该格的原数字，用于清理笔记
                // 但用户如果重新标记，自然会有新候选，所以不额外处理
                grid[r][c] = 0;
                state.notes[r][c].clear();
                renderBoard();
            }
            return;
        }

        // ---- 相同数字不做任何事 ----
        if (grid[r][c] === num) return;

        // ---- 检查是否正确 ----
        if (num !== state.solution[r][c]) {
            // 错误！
            state.mistakes++;
            mistakesDisplay.textContent = state.mistakes;

            // 仍然填入数字让玩家看到错在哪
            grid[r][c] = num;
            state.notes[r][c].clear();
            notesPruneNumber(num, r, c);
            renderBoard();

            // 声光反馈 + 扣分
            playErrorSound();
            const cell = boardEl.children[r * 9 + c];
            if (cell) cell.classList.add('shake');
            state.streak = 0;
            addScore(-30, r, c);

            // 检查是否超限
            if (state.mistakes >= state.maxMistakes) {
                gameOver(false);
            }
            return;
        }

        // ---- 正确填入 ----
        grid[r][c] = num;
        state.notes[r][c].clear();
        notesPruneNumber(num, r, c);
        renderBoard();

        // 声光反馈 + 加分（含连击）
        playCorrectSound();
        const cell = boardEl.children[r * 9 + c];
        if (cell) cell.classList.add('pop');
        state.streak++;
        const sMult = state.streak >= 5 ? 3 : state.streak >= 3 ? 2 : state.streak >= 2 ? 1.5 : 1;
        addScore(Math.round(10 * sMult), r, c);

        // 检查行/列/宫是否填满
        checkAndAnimateLineCompletion(r, c);

        // 检查是否完成
        if (checkWin()) {
            gameOver(true);
        }
    };


    // ==============================================================
    // 声光反馈 — 行/列/宫填满
    // ==============================================================

    /** 播放简短的琶音 (C5→E5→G5) */
    let _audioCtx = null;
    const _getCtx = () => {
        if (!_audioCtx) try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
        return _audioCtx;
    };

    const playNote = (freq, time, dur, vol = 0.1, type = 'sine') => {
        const ctx = _getCtx();
        if (!ctx) return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol, time + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + dur + 0.05);
        } catch (e) {}
    };

    const playCompletionSound = () => {
        const ctx = _getCtx();
        if (!ctx) return;
        try {
            const t = ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((f, i) => playNote(f, t + i * 0.08, 0.33, 0.1, 'sine'));
        } catch (e) {}
    };

    const playCorrectSound = () => {
        const ctx = _getCtx();
        if (!ctx) return;
        playNote(880, ctx.currentTime, 0.08, 0.06, 'sine'); // A5 轻快短音
    };

    const playErrorSound = () => {
        const ctx = _getCtx();
        if (!ctx) return;
        const t = ctx.currentTime;
        playNote(220, t, 0.3, 0.08, 'sawtooth');   // A3 低沉
        playNote(175, t + 0.06, 0.25, 0.05, 'sawtooth'); // F3 不协和
    };

    const playVictorySound = () => {
        const ctx = _getCtx();
        if (!ctx) return;
        const t = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playNote(f, t + i * 0.12, 0.4, 0.12, 'sine'));
    };

    // ==============================================================
    // 积分系统
    // ==============================================================

    const DIFF_MULT = { easy: 1, medium: 1.5, hard: 2.5, expert: 4 };

    const updateScoreDisplay = () => {
        scoreDisplay.textContent = state.score;
    };

    /** 弹出浮动加分文字 */
    const showFloatingScore = (points, r, c) => {
        if (!points) return;
        const cell = boardEl.children[r * 9 + c];
        if (!cell) return;
        const rect = cell.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'score-float';
        const sign = points > 0 ? '+' : '';
        el.textContent = `${sign}${points}`;
        el.style.color = points > 0 ? '#5a8a6f' : '#b85c5c';
        el.style.left = (rect.left + rect.width / 2 - 14) + 'px';
        el.style.top = rect.top + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    };

    const addScore = (points, r, c) => {
        state.score += points;
        if (state.score < 0) state.score = 0;
        updateScoreDisplay();
        showFloatingScore(points, r, c);
    };

    /** 计算最终总分 */
    const calcFinalScore = () => {
        const mult = DIFF_MULT[state.difficulty] || 1;
        const base = state.score * mult;
        const bonus = 100 * mult;
        const noHint = state.hintsUsed === 0 ? 200 * mult : 0;
        const noErr = state.mistakes === 0 ? 150 * mult : 0;
        const time = Math.max(0, Math.round((1800 - state.timerSeconds) * 0.5 * mult));
        return Math.round(base + bonus + noHint + noErr + time);
    };

    /**
     * 检查刚填入 (r,c) 后所在行/列/宫是否全部填满
     * 如果填满，添加高亮动效 class + 播放音效
     */
    const checkAndAnimateLineCompletion = (r, c) => {
        const grid = state.userGrid;
        let completed = false;

        // 检查行
        if (grid[r].every(v => v !== 0)) {
            for (let cc = 0; cc < 9; cc++) {
                const el = boardEl.children[r * 9 + cc];
                if (el) el.classList.add('line-complete');
            }
            completed = true;
        }

        // 检查列
        if (grid.every(row => row[c] !== 0)) {
            for (let rr = 0; rr < 9; rr++) {
                const el = boardEl.children[rr * 9 + c];
                if (el) el.classList.add('line-complete');
            }
            completed = true;
        }

        // 检查宫
        const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
        let boxFull = true;
        for (let rr = sr; rr < sr + 3 && boxFull; rr++)
            for (let cc = sc; cc < sc + 3; cc++)
                if (grid[rr][cc] === 0) { boxFull = false; break; }
        if (boxFull) {
            for (let rr = sr; rr < sr + 3; rr++)
                for (let cc = sc; cc < sc + 3; cc++) {
                    const el = boardEl.children[rr * 9 + cc];
                    if (el) el.classList.add('line-complete');
                }
            completed = true;
        }

        if (completed) {
            playCompletionSound();
            setTimeout(() => {
                boardEl.querySelectorAll('.line-complete').forEach(el => el.classList.remove('line-complete'));
            }, 700);
        }
    };

    // ==============================================================
    // 事件处理 — 提示
    // ==============================================================

    /**
     * 提示：优先使用逻辑推理找出可填的数字
     *
     * 推理优先级：
     *   1. 唯余法（Naked Single）— 某格只有一个候选数
     *   2. 隐唯法（Hidden Single）— 某数在行/列/宫中只能填在某格
     *   3. 兜底：直接揭晓一个正确答案
     */
    const giveHint = () => {
        if (state.isGameOver) return;

        const remaining = state.maxHints - state.hintsUsed;
        if (remaining <= 0) {
            showOverlay('💡 提示次数已用完（最多 3 次）', { single: true });
            return;
        }

        state.hintsUsed++;
        hintCount.textContent = remaining - 1;
        if (remaining - 1 <= 0) hintBtn.disabled = true;

        // 提示扣分（显示在已选中格上，无选中格则扣在 0,0）
        const hintR = state.selectedRow >= 0 ? state.selectedRow : 0;
        const hintC = state.selectedCol >= 0 ? state.selectedCol : 0;
        addScore(-50, hintR, hintC);

        const grid = state.userGrid;
        const solution = state.solution;
        const fixed = state.fixedCells;

        // 计算某个空格当前可填的数字（不修改 state.notes）
        const getCandidates = (r, c) => {
            if (grid[r][c] !== 0) return new Set();
            const present = new Set();
            for (let i = 0; i < 9; i++) {
                if (grid[r][i] !== 0) present.add(grid[r][i]);
                if (grid[i][c] !== 0) present.add(grid[i][c]);
            }
            const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
            for (let rr = sr; rr < sr + 3; rr++)
                for (let cc = sc; cc < sc + 3; cc++)
                    if (grid[rr][cc] !== 0) present.add(grid[rr][cc]);
            const cands = new Set();
            for (let n = 1; n <= 9; n++) if (!present.has(n)) cands.add(n);
            return cands;
        };

        const placeAndPrune = (r, c, num) => {
            grid[r][c] = num;
            state.notes[r][c].clear();
            notesPruneNumber(num, r, c);
        };

        // ---- 1. 唯余法：找一个只有一个候选数的空格 ----
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (fixed[r][c] || grid[r][c] !== 0) continue;
                const cands = getCandidates(r, c);
                if (cands.size === 1) {
                    const num = [...cands][0];
                    placeAndPrune(r, c, num);
                    renderBoard();
                    flashHintCell(r, c);
                    checkAndAnimateLineCompletion(r, c);
                    showInfo(`💡 唯余法：第 ${r + 1} 行第 ${c + 1} 列只有 ${num} 可以填`);
                    if (checkWin()) gameOver(true);
                    return;
                }
            }
        }

        // ---- 2. 隐唯法：在行/列/宫中找一个数只能填在某格 ----
        // 检查行
        for (let r = 0; r < 9; r++) {
            for (let num = 1; num <= 9; num++) {
                let foundInRow = false;
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === num) { foundInRow = true; break; }
                }
                if (foundInRow) continue;

                const possible = [];
                for (let c = 0; c < 9; c++) {
                    if (!fixed[r][c] && grid[r][c] === 0 && getCandidates(r, c).has(num)) {
                        possible.push(c);
                    }
                }
                if (possible.length === 1) {
                    const c = possible[0];
                    placeAndPrune(r, c, num);
                    renderBoard();
                    flashHintCell(r, c);
                    checkAndAnimateLineCompletion(r, c);
                    showInfo(`💡 隐唯法：第 ${r + 1} 行中只有第 ${c + 1} 列可以填 ${num}`);
                    if (checkWin()) gameOver(true);
                    return;
                }
            }
        }

        // 检查列
        for (let c = 0; c < 9; c++) {
            for (let num = 1; num <= 9; num++) {
                let foundInCol = false;
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c] === num) { foundInCol = true; break; }
                }
                if (foundInCol) continue;

                const possible = [];
                for (let r = 0; r < 9; r++) {
                    if (!fixed[r][c] && grid[r][c] === 0 && getCandidates(r, c).has(num)) {
                        possible.push(r);
                    }
                }
                if (possible.length === 1) {
                    const r = possible[0];
                    placeAndPrune(r, c, num);
                    renderBoard();
                    flashHintCell(r, c);
                    checkAndAnimateLineCompletion(r, c);
                    showInfo(`💡 隐唯法：第 ${c + 1} 列中只有第 ${r + 1} 行可以填 ${num}`);
                    if (checkWin()) gameOver(true);
                    return;
                }
            }
        }

        // 检查宫
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                const sr = br * 3, sc = bc * 3;
                for (let num = 1; num <= 9; num++) {
                    let foundInBox = false;
                    for (let rr = sr; rr < sr + 3; rr++) {
                        for (let cc = sc; cc < sc + 3; cc++) {
                            if (grid[rr][cc] === num) { foundInBox = true; break; }
                        }
                        if (foundInBox) break;
                    }
                    if (foundInBox) continue;

                    const possible = [];
                    for (let rr = sr; rr < sr + 3; rr++) {
                        for (let cc = sc; cc < sc + 3; cc++) {
                            if (!fixed[rr][cc] && grid[rr][cc] === 0 && getCandidates(rr, cc).has(num)) {
                                possible.push([rr, cc]);
                            }
                        }
                    }
                    if (possible.length === 1) {
                        const [r, c] = possible[0];
                        placeAndPrune(r, c, num);
                        renderBoard();
                        flashHintCell(r, c);
                        checkAndAnimateLineCompletion(r, c);
                        showInfo(`💡 隐唯法：第 ${br + 1} 行第 ${bc + 1} 格的宫中只有 (${r + 1},${c + 1}) 可以填 ${num}`);
                        if (checkWin()) gameOver(true);
                        return;
                    }
                }
            }
        }

        // ---- 3. 兜底：直接揭晓一个空格 ----
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!fixed[r][c] && grid[r][c] === 0) {
                    placeAndPrune(r, c, solution[r][c]);
                    renderBoard();
                    flashHintCell(r, c);
                    checkAndAnimateLineCompletion(r, c);
                    showInfo(`💡 第 ${r + 1} 行第 ${c + 1} 列应该填 ${solution[r][c]}`);
                    if (checkWin()) gameOver(true);
                    return;
                }
            }
        }

        showInfo('✅ 所有格子都已正确！');
    };

    /**
     * 闪烁提示格子
     */
    const flashHintCell = (r, c) => {
        const cells = boardEl.querySelectorAll('.cell');
        cells.forEach(el => {
            if (parseInt(el.dataset.row) === r && parseInt(el.dataset.col) === c) {
                el.classList.add('hint-glow');
                setTimeout(() => el.classList.remove('hint-glow'), 1200);
            }
        });
    };



    // ==============================================================
    // 事件处理 — 切换难度
    // ==============================================================

    /**
     * 切换难度，更新按钮高亮，重新开始游戏
     * @param {string} diff — easy|medium|hard|expert
     */
    const setDifficulty = (diff) => {
        state.difficulty = diff;
        diffButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
        resetGame(diff);  // 自动开始新游戏
    };


    // ==============================================================
    // 键盘快捷键支持
    // ==============================================================

    /**
     * 键盘事件处理器
     *
     * 快捷键对照表：
     *   1-9     → 填入数字
     *   Backspace/Delete → 擦除
     *   方向键   → 移动选中格
     */
    const handleKeydown = (e) => {
        if (state.isGameOver) return;

        const key = e.key;

        if (key >= '1' && key <= '9') {
            e.preventDefault();
            placeNumber(parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            e.preventDefault();
            placeNumber(0);
        } else if (key.startsWith('Arrow')) {
            e.preventDefault();
            let { selectedRow: r, selectedCol: c } = state;
            // 如果没有选中格，默认从 (0,0) 开始
            if (r < 0 || c < 0) {
                r = 0;
                c = 0;
            } else {
                if (key === 'ArrowUp')    r = Math.max(0, r - 1);
                if (key === 'ArrowDown')  r = Math.min(8, r + 1);
                if (key === 'ArrowLeft')  c = Math.max(0, c - 1);
                if (key === 'ArrowRight') c = Math.min(8, c + 1);
            }
            state.selectedRow = r;
            state.selectedCol = c;
            renderBoard();
        }
    };


    // ==============================================================
    // 事件处理 — 一键标记
    // ==============================================================

    /**
     * 遍历所有空格，填入行列宫中缺失的数字作为候选笔记
     */
    const autoMarkNotes = () => {
        if (state.isGameOver) return;

        const grid = state.userGrid;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] !== 0) {
                    // 已填数字的格子清空笔记及移除追踪
                    state.notes[r][c].clear();
                    state.userRemovedNotes[r][c].clear();
                    continue;
                }

                // 收集行、列、宫中已出现的数字
                const present = new Set();

                // 行
                for (let i = 0; i < 9; i++) {
                    if (grid[r][i] !== 0) present.add(grid[r][i]);
                }
                // 列
                for (let i = 0; i < 9; i++) {
                    if (grid[i][c] !== 0) present.add(grid[i][c]);
                }
                // 宫
                const sr = Math.floor(r / 3) * 3;
                const sc = Math.floor(c / 3) * 3;
                for (let rr = sr; rr < sr + 3; rr++) {
                    for (let cc = sc; cc < sc + 3; cc++) {
                        if (grid[rr][cc] !== 0) present.add(grid[rr][cc]);
                    }
                }

                // 候选数 = 1-9 减去已出现的数字
                const candidates = new Set();
                for (let n = 1; n <= 9; n++) {
                    if (!present.has(n)) candidates.add(n);
                }
                // 再排除用户手动移除的候选（之前编辑过的标记不再出现）
                state.userRemovedNotes[r][c].forEach(n => candidates.delete(n));
                state.notes[r][c] = candidates;
            }
        }

    };


    // ==============================================================
    // 单格自动备注 — 只给当前选中的格子计算候选数
    // ==============================================================

    const autoMarkCell = () => {
        if (state.isGameOver) return;
        const { selectedRow: r, selectedCol: c } = state;
        if (r < 0 || c < 0) return;
        if (state.fixedCells[r][c]) return;
        if (state.userGrid[r][c] !== 0) return;

        SudokuEngine.calcCandidatesForCell(
            state.userGrid, r, c,
            state.notes, state.userRemovedNotes
        );
        renderBoard();
    };

    /**
     * 在 (row, col) 填入数字后，从同行/同列/同宫的空格笔记中移除该数字
     * 只清理不添加，不会自动填充新候选
     */
    const notesPruneNumber = (num, row, col) => {
        if (state.isGameOver || num === 0) return;
        // 行
        for (let i = 0; i < 9; i++) {
            if (state.userGrid[row][i] === 0) {
                state.notes[row][i].delete(num);
            }
        }
        // 列
        for (let i = 0; i < 9; i++) {
            if (state.userGrid[i][col] === 0) {
                state.notes[i][col].delete(num);
            }
        }
        // 宫
        const sr = Math.floor(row / 3) * 3;
        const sc = Math.floor(col / 3) * 3;
        for (let rr = sr; rr < sr + 3; rr++) {
            for (let cc = sc; cc < sc + 3; cc++) {
                if (state.userGrid[rr][cc] === 0) {
                    state.notes[rr][cc].delete(num);
                }
            }
        }
    };


    // ==============================================================
    // 初始化
    // ==============================================================

    /**
     * 绑定所有事件，启动游戏
     */
    const init = () => {
        // 数字面板按钮点击
        document.querySelectorAll('.num-grid button[data-num]').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.dataset.num);
                placeNumber(num);
            });
        });

        // 擦除按钮（在 action-buttons 中，单独绑定）
        document.querySelector('.erase-btn').addEventListener('click', () => {
            placeNumber(0);
        });

        // 全部标记 — 切换开关（次级操作区 → 火箭图标）
        autoMarkBtn.addEventListener('click', () => {
            state.allNotesOn = !state.allNotesOn;
            if (state.allNotesOn) {
                autoMarkNotes();
            } else {
                // 清空所有笔记
                for (let r = 0; r < 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        state.notes[r][c].clear();
                        state.userRemovedNotes[r][c].clear();
                    }
                }
            }
            autoMarkBtn.classList.toggle('active', state.allNotesOn);
            renderBoard();
        });

        // 单格备注
        markCellBtn.addEventListener('click', autoMarkCell);

        // 候选编辑模式切换（铅笔图标按钮）
        notesToggleBtn.addEventListener('click', () => {
            state.isCandidateEditMode = !state.isCandidateEditMode;
            notesToggleBtn.classList.toggle('active', state.isCandidateEditMode);
        });

        newGameBtn.addEventListener('click', () => {
            showOverlay('开始新游戏？当前进度将丢失。', { onOk: () => resetGame(state.difficulty) });
        });

        // 提示
        hintBtn.addEventListener('click', giveHint);

        // 排行榜
        leaderboardBtn.addEventListener('click', showLeaderboard);
        lbClose.addEventListener('click', () => lbOverlay.classList.remove('show'));
        lbOverlay.addEventListener('click', (e) => {
            if (e.target === lbOverlay) lbOverlay.classList.remove('show');
        });
        lbFilters.addEventListener('click', (e) => {
            const btn = e.target.closest('.lb-filter');
            if (btn) renderLeaderboard(btn.dataset.filter);
        });

        // 难度切换
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.dataset.diff;
                if (diff !== state.difficulty) {
                    setDifficulty(diff);
                }
            });
        });

        // 缩放控制（滑块）
        const zoomSlider = document.getElementById('zoomSlider');
        const zoomLabel = document.getElementById('zoomLabel');

        try {
            const saved = parseInt(localStorage.getItem('sudoku-zoom'));
            if (saved >= 70 && saved <= 130) zoomSlider.value = saved;
        } catch (e) {}

        const applyZoom = (val) => {
            const scale = val / 100;
            document.documentElement.style.setProperty('--ui-scale', scale);
            zoomLabel.textContent = val + '%';
            try { localStorage.setItem('sudoku-zoom', val); } catch (e) {}
        };

        // 拖动时只更新标签数值，松开后才实际缩放
        zoomSlider.addEventListener('input', () => {
            zoomLabel.textContent = zoomSlider.value + '%';
        });
        zoomSlider.addEventListener('change', () => applyZoom(parseInt(zoomSlider.value)));
        applyZoom(parseInt(zoomSlider.value));

        // 键盘快捷键（全局）
        document.addEventListener('keydown', handleKeydown);

        // 以"简单"难度启动游戏
        resetGame('easy');
    };

    // 等待 DOM 加载完成后初始化
    // 如果 DOM 已经加载了，直接执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
