// ==================================================================
// 提示推理模块 — 纯算法，无副作用
// ==================================================================

(function() {
const S = window.S;

/**
 * 根据当前盘面找出最合适的提示位置
 * @param {number[][]} grid      — 用户当前盘面
 * @param {number[][]} solution  — 完整答案
 * @param {boolean[][]} fixed    — 固定格标记
 * @returns {{ r: number, c: number, num: number, method: string } | null}
 */
S.findHint = (grid, solution, fixed) => {

    const getCandidates = (r, c) => {
        if (grid[r][c] !== 0) return new Set();
        const p = new Set();
        for (let i = 0; i < 9; i++) {
            if (grid[r][i] !== 0) p.add(grid[r][i]);
            if (grid[i][c] !== 0) p.add(grid[i][c]);
        }
        const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
        for (let rr = sr; rr < sr + 3; rr++)
            for (let cc = sc; cc < sc + 3; cc++)
                if (grid[rr][cc] !== 0) p.add(grid[rr][cc]);
        const r2 = new Set();
        for (let n = 1; n <= 9; n++) if (!p.has(n)) r2.add(n);
        return r2;
    };

    // 1. 唯余法 — 找一个只有一个候选数的空格
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (fixed[r][c] || grid[r][c] !== 0) continue;
        const cs = getCandidates(r, c);
        if (cs.size === 1) return { r, c, num: [...cs][0], method: 'naked' };
    }

    // 2. 隐唯法 — 行
    for (let r = 0; r < 9; r++) for (let n = 1; n <= 9; n++) {
        let ok = false; for (let c = 0; c < 9; c++) if (grid[r][c] === n) { ok = true; break; }
        if (ok) continue;
        const ps = []; for (let c = 0; c < 9; c++)
            if (!fixed[r][c] && grid[r][c] === 0 && getCandidates(r, c).has(n)) ps.push(c);
        if (ps.length === 1) return { r, c: ps[0], num: n, method: 'hidden_row' };
    }

    // 3. 隐唯法 — 列
    for (let c = 0; c < 9; c++) for (let n = 1; n <= 9; n++) {
        let ok = false; for (let r = 0; r < 9; r++) if (grid[r][c] === n) { ok = true; break; }
        if (ok) continue;
        const ps = []; for (let r = 0; r < 9; r++)
            if (!fixed[r][c] && grid[r][c] === 0 && getCandidates(r, c).has(n)) ps.push(r);
        if (ps.length === 1) return { r: ps[0], c, num: n, method: 'hidden_col' };
    }

    // 4. 隐唯法 — 宫
    for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) for (let n = 1; n <= 9; n++) {
        const sr = br * 3, sc = bc * 3;
        let ok = false;
        for (let rr = sr; rr < sr + 3 && !ok; rr++) for (let cc = sc; cc < sc + 3; cc++)
            if (grid[rr][cc] === n) { ok = true; break; }
        if (ok) continue;
        const ps = [];
        for (let rr = sr; rr < sr + 3; rr++) for (let cc = sc; cc < sc + 3; cc++)
            if (!fixed[rr][cc] && grid[rr][cc] === 0 && getCandidates(rr, cc).has(n)) ps.push([rr, cc]);
        if (ps.length === 1) return { r: ps[0][0], c: ps[0][1], num: n, method: 'hidden_box' };
    }

    // 5. 兜底 — 揭晓第一个空格
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
        if (!fixed[r][c] && grid[r][c] === 0) return { r, c, num: solution[r][c], method: 'fallback' };

    return null; // 没有空格
};

})();
