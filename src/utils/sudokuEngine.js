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

export default SudokuEngine;
