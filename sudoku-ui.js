// ==================================================================
// UI 模块 — 棋盘渲染、弹窗、动画
// ==================================================================

(function() {
const S = window.S;

// ==============================================================
// 弹窗
// ==============================================================

S.hideOverlay = () => {
    S.el.overlay.classList.remove('show');
    S.el.confirmOk.textContent = '确认';
    S.el.confirmCancel.style.display = '';
};

S.showOverlay = (msg, opts = {}) => {
    S.el.confirmMsg.innerHTML = msg;
    if (opts.single) {
        S.el.confirmOk.textContent = '确定';
        S.el.confirmCancel.style.display = 'none';
    }
    S.el.overlay.classList.add('show');

    const done = (result) => {
        S.hideOverlay();
        S.el.confirmOk.removeEventListener('click', onOk);
        S.el.confirmCancel.removeEventListener('click', onCancel);
        S.el.overlay.removeEventListener('click', onBg);
        if (result === 'ok' && opts.onOk) opts.onOk();
        if (result === 'cancel' && opts.onCancel) opts.onCancel();
    };
    const onOk = () => done('ok');
    const onCancel = () => done('cancel');
    const onBg = (e) => { if (e.target === S.el.overlay) onCancel(); };
    S.el.confirmOk.addEventListener('click', onOk);
    S.el.confirmCancel.addEventListener('click', onCancel);
    if (!opts.single) S.el.overlay.addEventListener('click', onBg);
};

/** 底部非阻塞信息栏，3 秒后消失 */
let _infoTimer = null;
S.showInfo = (msg) => {
    if (_infoTimer) clearTimeout(_infoTimer);
    S.el.infoBar.textContent = msg;
    S.el.infoBar.classList.add('show');
    _infoTimer = setTimeout(() => S.el.infoBar.classList.remove('show'), 3000);
};


// ==============================================================
// 棋盘渲染
// ==============================================================

S.renderBoard = () => {
    const b = S.el.board;
    b.innerHTML = '';

    const g = S.state.userGrid;
    const fx = S.state.fixedCells;
    const nt = S.state.notes;
    const sr = S.state.selectedRow;
    const sc = S.state.selectedCol;

    let selNum = null;
    if (sr >= 0 && sc >= 0 && g[sr][sc] !== 0) selNum = g[sr][sc];

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cel = document.createElement('div');
            cel.className = 'cell';
            cel.dataset.row = r;
            cel.dataset.col = c;

            const v = g[r][c];
            if (fx[r][c]) cel.classList.add('fixed');
            else if (v !== 0) cel.classList.add('user-input');

            if (r === sr && c === sc) cel.classList.add('selected');

            const sameBlock = Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3);
            if ((r === sr || c === sc || sameBlock) && !(r === sr && c === sc)) {
                cel.classList.add('highlighted');
            }
            if (selNum !== null && v === selNum && !(r === sr && c === sc)) {
                cel.classList.add('same-number');
            }

            if (v !== 0) {
                cel.textContent = v;
            } else if (nt[r][c] && nt[r][c].size > 0) {
                const nc = document.createElement('div');
                nc.className = 'notes-container';
                const sorted = Array.from(nt[r][c]).sort((a, b) => a - b);
                for (let n = 1; n <= 9; n++) {
                    const sp = document.createElement('span');
                    sp.textContent = sorted.includes(n) ? n : '';
                    nc.appendChild(sp);
                }
                cel.appendChild(nc);
            }

            cel.addEventListener('click', () => S.onCellClick(r, c));
            b.appendChild(cel);
        }
    }

    S.markErrors();
    S.updateNumPadState();
};


// ==============================================================
// 错误标记
// ==============================================================

S.markErrors = () => {
    const cells = S.el.board.querySelectorAll('.cell');
    const g = S.state.userGrid;
    const fx = S.state.fixedCells;

    cells.forEach(c => c.classList.remove('error'));
    cells.forEach(c => {
        const r = parseInt(c.dataset.row);
        const co = parseInt(c.dataset.col);
        if (!fx[r][co] && g[r][co] !== 0 && g[r][co] !== S.state.solution[r][co]) {
            c.classList.add('error');
        }
    });
};


// ==============================================================
// 数字耗尽
// ==============================================================

S.updateNumPadState = () => {
    const cnt = Array(10).fill(0);
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++) {
            const v = S.state.userGrid[r][c];
            if (v > 0) cnt[v]++;
        }
    document.querySelectorAll('.num-grid button[data-num]').forEach(b => {
        const n = parseInt(b.dataset.num);
        if (n === 0) return;
        const disabled = cnt[n] >= 9;
        b.disabled = disabled;
        b.classList.toggle('depleted', disabled);
    });
};


// ==============================================================
// 积分显示
// ==============================================================

S.updateScoreDisplay = () => {
    S.el.scoreDisplay.textContent = S.state.score;
};

/** 浮动加分/扣分文字 */
S.showFloatingScore = (pts, r, c) => {
    if (!pts) return;
    const cel = S.el.board.children[r * 9 + c];
    if (!cel) return;
    const rect = cel.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'score-float';
    el.textContent = `${pts > 0 ? '+' : ''}${pts}`;
    el.style.color = pts > 0 ? '#5a8a6f' : '#b85c5c';
    el.style.left = (rect.left + rect.width / 2 - 14) + 'px';
    el.style.top = rect.top + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
};


// ==============================================================
// 行/列/宫完成动画
// ==============================================================

S.checkAndAnimateLineCompletion = (r, c) => {
    const g = S.state.userGrid;
    let done = false;

    if (g[r].every(v => v !== 0)) {
        for (let cc = 0; cc < 9; cc++) {
            const cel = S.el.board.children[r * 9 + cc];
            if (cel) cel.classList.add('line-complete');
        }
        done = true;
    }

    if (g.every(row => row[c] !== 0)) {
        for (let rr = 0; rr < 9; rr++) {
            const cel = S.el.board.children[rr * 9 + c];
            if (cel) cel.classList.add('line-complete');
        }
        done = true;
    }

    const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
    let full = true;
    for (let rr = sr; rr < sr + 3 && full; rr++)
        for (let cc = sc; cc < sc + 3; cc++)
            if (g[rr][cc] === 0) { full = false; break; }
    if (full) {
        for (let rr = sr; rr < sr + 3; rr++)
            for (let cc = sc; cc < sc + 3; cc++) {
                const cel = S.el.board.children[rr * 9 + cc];
                if (cel) cel.classList.add('line-complete');
            }
        done = true;
    }

    if (done) {
        S.playCompletionSound();
        setTimeout(() => {
            S.el.board.querySelectorAll('.line-complete').forEach(el => el.classList.remove('line-complete'));
        }, 700);
    }
};

/** 提示格子闪烁 */
S.flashHintCell = (r, c) => {
    S.el.board.querySelectorAll('.cell').forEach(el => {
        if (parseInt(el.dataset.row) === r && parseInt(el.dataset.col) === c) {
            el.classList.add('hint-glow');
            setTimeout(() => el.classList.remove('hint-glow'), 1200);
        }
    });
};

})();
