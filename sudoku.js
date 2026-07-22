/* ==================================================================
   数独游戏 — JavaScript 核心代码
   ==================================================================
   文件分两大部分：
     1. SudokuEngine — 数独核心算法（生成、求解、验证）
     2. UI 控制器    — 界面交互、绑定事件、渲染棋盘

   如果你想改游戏机制（比如限制错误次数、计时逻辑），
   或调整交互行为（比如点击/键盘的响应方式），改这个文件。
   ================================================================== */


// ==================================================================
// 第一部分：SudokuEngine — 纯算法模块
// ==================================================================
// 使用 IIFE（立即执行函数）封装，对外只暴露需要的方法。
// 不依赖任何 DOM，可以单独测试或复用到其他项目。
// ==================================================================

const SudokuEngine = (() => {

    // ---------- 工具函数 ----------

    /**
     * Fisher-Yates 洗牌算法 — 随机打乱数组顺序
     * @param {Array} arr — 要打乱的数组
     * @returns {Array} — 打乱后的原数组（原地修改）
     */
    const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    /**
     * 深拷贝二维数组（9×9 数独棋盘）
     * @param {number[][]} grid — 9×9 二维数组
     * @returns {number[][]} — 全新的副本
     */
    const deepCopy = (grid) => grid.map(row => [...row]);


    // ---------- 合规性检查 ----------

    /**
     * 检查在 (row, col) 放置 num 是否合法
     * 数独三条规则：
     *   1. 同一行不能有重复数字
     *   2. 同一列不能有重复数字
     *   3. 所在 3×3 宫格内不能有重复数字
     *
     * @param {number[][]} grid — 当前盘面
     * @param {number} row — 行号 0-8
     * @param {number} col — 列号 0-8
     * @param {number} num — 要放置的数字 1-9
     * @returns {boolean} — true 表示可以放
     */
    const isValidPlacement = (grid, row, col, num) => {
        // 检查行和列
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) return false;  // 行重复
            if (grid[i][col] === num) return false;  // 列重复
        }
        // 计算 3×3 宫格的左上角坐标
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        // 检查宫格内
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (grid[r][c] === num) return false;
            }
        }
        return true;
    };


    // ---------- 求解器（回溯法）----------

    /**
     * 用回溯算法求解数独
     * 思路：从左到右、从上到下找空格，尝试填 1-9，
     * 合法就递归，不行就回溯（撤销）。
     *
     * @param {number[][]} grid — 待解的盘面（0 表示空格）
     * @returns {number[][]|null} — 解出来的完整盘面，无解返回 null
     */
    const solve = (grid) => {
        const board = deepCopy(grid);  // 在副本上操作，不修改原数据

        const solver = (b) => {
            // 遍历每个格子
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (b[r][c] === 0) {          // 找到空格
                        for (let num = 1; num <= 9; num++) {
                            if (isValidPlacement(b, r, c, num)) {
                                b[r][c] = num;     // 尝试填
                                if (solver(b)) return true;  // 递归
                                b[r][c] = 0;       // 回溯（撤销）
                            }
                        }
                        return false;  // 1-9 都试过不行，无解
                    }
                }
            }
            return true;  // 所有格子都填完了
        };

        return solver(board) ? board : null;
    };

    /**
     * 计数求解器 — 统计盘面有多少个解（上限为 limit）
     * 用于唯一性检测：countSolutions(puzzle, 2) === 1 即为唯一解
     *
     * @param {number[][]} grid — 待解的盘面（0 表示空格）
     * @param {number} [limit=2] — 最多数到几个解就停止
     * @returns {number} — 找到的解的数量（不超过 limit）
     */
    const countSolutions = (grid, limit = 2) => {
        const board = deepCopy(grid);
        let count = 0;

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
            // 找到一个完整解
            count++;
            return count >= limit;  // 够了就停
        };

        solver(board);
        return count;
    };


    // ---------- 生成完整盘面 ----------

    /**
     * 随机生成一个完整有效的数独盘面
     * 同样用回溯法，但数字顺序随机打乱，每次生成不一样
     *
     * @returns {number[][]} — 完整的 9×9 盘面
     */
    const generateComplete = () => {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));

        const fill = (b) => {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (b[r][c] === 0) {
                        // 打乱 1-9 的顺序，这样每次生成的盘面不同
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


    // ---------- 挖洞生成谜题 ----------

    /**
     * 从完整盘面上挖掉一些数字，生成谜题
     *
     * 核心逻辑：
     *   1. 先生成一个完整解
     *   2. 将 81 个位置随机打乱
     *   3. 逐个位置尝试挖掉数字
     *   4. 每挖一个就用计数求解器判断唯一性：
     *      - 0 个解 → 恢复
     *      - 2+ 个解 → 恢复（保证唯一解）
     *      - 恰好 1 个解 → 确认挖掉
     *   5. 挖到目标数量为止
     *
     * @param {string} difficulty — 难度：easy|medium|hard|expert
     * @returns {{ puzzle: number[][], solution: number[][] }}
     *          puzzle = 给玩家看的谜题（0 是空格）
     *          solution = 完整的正确答案
     */
    const generatePuzzle = (difficulty) => {
        // 不同难度对应挖掉多少个数字（空格数）
        const blanksMap = {
            easy: 32,      // 剩余 49 个已知数字
            medium: 40,    // 剩余 41 个
            hard: 48,      // 剩余 33 个
            expert: 54,    // 剩余 27 个
        };
        const targetBlanks = blanksMap[difficulty] || 40;

        const full = generateComplete();          // 生成完整解
        const puzzle = deepCopy(full);            // 在副本上挖洞

        // 生成所有位置并打乱
        const positions = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                positions.push([r, c]);
            }
        }
        shuffle(positions);

        // 逐个挖洞
        let removed = 0;
        for (const [r, c] of positions) {
            if (removed >= targetBlanks) break;

            const backup = puzzle[r][c];  // 暂存原数字
            puzzle[r][c] = 0;             // 挖掉

            // 用计数求解器判断：无解（0）或多解（2+）都恢复
            const numSolutions = countSolutions(puzzle, 2);
            if (numSolutions !== 1) {
                puzzle[r][c] = backup;  // 不唯一或无解，恢复
            } else {
                removed++;              // 唯一解，确认挖掉
            }
        }

        return { puzzle, solution: full };
    };

    /**
     * 计算某个空格在当前盘面中的候选数字
     * @param {number[][]} grid — 当前盘面
     * @param {number} r — 行号
     * @param {number} c — 列号
     * @param {Set[]} notes — 笔记数组
     * @param {Set[]} userRemovedNotes — 用户手动移除的记录
     */
    const calcCandidatesForCell = (grid, r, c, notes, userRemovedNotes) => {
        if (grid[r][c] !== 0) {
            notes[r][c].clear();
            userRemovedNotes[r][c].clear();
            return;
        }

        const present = new Set();
        for (let i = 0; i < 9; i++) {
            if (grid[r][i] !== 0) present.add(grid[r][i]);
            if (grid[i][c] !== 0) present.add(grid[i][c]);
        }
        const sr = Math.floor(r / 3) * 3;
        const sc = Math.floor(c / 3) * 3;
        for (let rr = sr; rr < sr + 3; rr++) {
            for (let cc = sc; cc < sc + 3; cc++) {
                if (grid[rr][cc] !== 0) present.add(grid[rr][cc]);
            }
        }

        const candidates = new Set();
        for (let n = 1; n <= 9; n++) {
            if (!present.has(n)) candidates.add(n);
        }
        userRemovedNotes[r][c].forEach(n => candidates.delete(n));
        notes[r][c] = candidates;
    };

    // ==============================================================
    // 对外暴露的 API
    // ==============================================================
    return {
        generatePuzzle,   // 生成谜题（含唯一解检测）
        solve,            // 求解任意盘面
        isValidPlacement, // 判断某个位置放某数是否合法
        deepCopy,         // 深拷贝 9×9 数组
        calcCandidatesForCell, // 计算单个格的候选数字
    };
})();


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
    const mistakesDisplay = document.getElementById('mistakesCount'); // 错误计数
    const notesToggleBtn = document.getElementById('notesToggle'); // 候选编辑按钮
    const autoMarkBtn = document.getElementById('autoMarkBtn'); // 全部标记按钮
    const markCellBtn = document.getElementById('markCellBtn'); // 单格备注按钮
    const newGameBtn = document.getElementById('newGameBtn');   // 新游戏按钮
    const hintBtn = document.getElementById('hintBtn');         // 提示按钮
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
        if (won) {
            alert('🎉 恭喜你完成数独！太棒啦！');
        } else {
            alert('💔 游戏结束！错误已达上限。点击「新游戏」重新开始。');
        }
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

        // 检查是否完成
        if (checkWin()) {
            gameOver(true);
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

        const grid = state.userGrid;
        const solution = state.solution;
        const fixed = state.fixedCells;
        const notes = state.notes;

        // 确保笔记是最新的
        autoMarkNotes();

        // ---- 1. 唯余法：找一个只有一个候选数的空格 ----
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (fixed[r][c] || grid[r][c] !== 0) continue;
                if (notes[r][c].size === 1) {
                    const num = [...notes[r][c]][0];
                    grid[r][c] = num;
                    state.notes[r][c].clear();
                    autoMarkNotes();
                    renderBoard();
                    flashHintCell(r, c);
                    alert(`💡 唯余法：第 ${r + 1} 行第 ${c + 1} 列只有 ${num} 可以填`);
                    if (checkWin()) gameOver(true);
                    return;
                }
            }
        }

        // ---- 2. 隐唯法：在行/列/宫中找一个数只能填在某格 ----
        // 检查行
        for (let r = 0; r < 9; r++) {
            for (let num = 1; num <= 9; num++) {
                // 找该行中 num 是否已在固定格或已填格中
                let foundInRow = false;
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === num) { foundInRow = true; break; }
                }
                if (foundInRow) continue;

                // 找该行中哪些空格可以填 num（num 在其笔记中）
                const possible = [];
                for (let c = 0; c < 9; c++) {
                    if (!fixed[r][c] && grid[r][c] === 0 && notes[r][c].has(num)) {
                        possible.push(c);
                    }
                }
                if (possible.length === 1) {
                    const c = possible[0];
                    grid[r][c] = num;
                    state.notes[r][c].clear();
                    autoMarkNotes();
                    renderBoard();
                    flashHintCell(r, c);
                    alert(`💡 隐唯法：第 ${r + 1} 行中只有第 ${c + 1} 列可以填 ${num}`);
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
                    if (!fixed[r][c] && grid[r][c] === 0 && notes[r][c].has(num)) {
                        possible.push(r);
                    }
                }
                if (possible.length === 1) {
                    const r = possible[0];
                    grid[r][c] = num;
                    state.notes[r][c].clear();
                    autoMarkNotes();
                    renderBoard();
                    flashHintCell(r, c);
                    alert(`💡 隐唯法：第 ${c + 1} 列中只有第 ${r + 1} 行可以填 ${num}`);
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
                            if (!fixed[rr][cc] && grid[rr][cc] === 0 && notes[rr][cc].has(num)) {
                                possible.push([rr, cc]);
                            }
                        }
                    }
                    if (possible.length === 1) {
                        const [r, c] = possible[0];
                        grid[r][c] = num;
                        state.notes[r][c].clear();
                        autoMarkNotes();
                        renderBoard();
                        flashHintCell(r, c);
                        alert(`💡 隐唯法：第 ${br + 1} 行第 ${bc + 1} 格的宫中只有 (${r + 1},${c + 1}) 可以填 ${num}`);
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
                    grid[r][c] = solution[r][c];
                    state.notes[r][c].clear();
                    autoMarkNotes();
                    renderBoard();
                    flashHintCell(r, c);
                    alert(`💡 第 ${r + 1} 行第 ${c + 1} 列应该填 ${solution[r][c]}`);
                    if (checkWin()) gameOver(true);
                    return;
                }
            }
        }

        // 所有非固定格都正确
        alert('所有格子都已正确！');
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

        // 新游戏 — 用自定义弹窗代替浏览器 confirm
        const confirmOverlay = document.getElementById('confirmOverlay');
        const confirmMsg = document.getElementById('confirmMsg');
        const confirmOk = document.getElementById('confirmOk');
        const confirmCancel = document.getElementById('confirmCancel');

        const showConfirm = (msg, onOk) => {
            confirmMsg.textContent = msg;
            confirmOverlay.classList.add('show');
            const cleanup = () => {
                confirmOverlay.classList.remove('show');
                confirmOk.removeEventListener('click', onOk);
                confirmCancel.removeEventListener('click', cleanup);
                confirmOverlay.removeEventListener('click', onBgClick);
            };
            const onBgClick = (e) => {
                if (e.target === confirmOverlay) cleanup();
            };
            confirmOk.addEventListener('click', () => { cleanup(); onOk(); });
            confirmCancel.addEventListener('click', cleanup);
            confirmOverlay.addEventListener('click', onBgClick);
        };

        newGameBtn.addEventListener('click', () => {
            showConfirm('开始新游戏？当前进度将丢失。', () => resetGame(state.difficulty));
        });

        // 提示
        hintBtn.addEventListener('click', giveHint);

        // 难度切换
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.dataset.diff;
                if (diff !== state.difficulty) {
                    setDifficulty(diff);
                }
            });
        });

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
