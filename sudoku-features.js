// ==================================================================
// 功能模块 — 积分、排行榜、存档续盘
// ==================================================================

(function() {
const S = window.S;
const D = { easy: 1, medium: 1.5, hard: 2.5, expert: 4 };
const DL = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' };

// ==============================================================
// 积分
// ==============================================================

S.addScore = (pts, r, c) => {
    S.state.score += pts;
    if (S.state.score < 0) S.state.score = 0;
    S.updateScoreDisplay();
    S.showFloatingScore(pts, r, c);
};

S.calcFinalScore = () => {
    const m = D[S.state.difficulty] || 1;
    const b = S.state.score * m;
    const bonus = 100 * m;
    const nh = S.state.hintsUsed === 0 ? 200 * m : 0;
    const ne = S.state.mistakes === 0 ? 150 * m : 0;
    const t = Math.max(0, Math.round((1800 - S.state.timerSeconds) * 0.5 * m));
    return Math.round(b + bonus + nh + ne + t);
};

/** 构建积分明细 HTML */
S.buildScoreDetailHTML = (total) => {
    const m = D[S.state.difficulty] || 1;
    const b = S.state.score * m;
    const bonus = 100 * m;
    const nh = S.state.hintsUsed === 0 ? 200 * m : 0;
    const ne = S.state.mistakes === 0 ? 150 * m : 0;
    const t = Math.max(0, Math.round((1800 - S.state.timerSeconds) * 0.5 * m));
    const dl = DL[S.state.difficulty] || S.state.difficulty;
    const fmt = n => `${n > 0 ? '+' : ''}${Math.round(n)}`;

    let h = `
        <div class="sd-row"><span class="sd-label">难度</span><span class="sd-val">${dl} (x${m})</span></div>
        <div class="sd-row"><span class="sd-label">基础分</span><span class="sd-val">${fmt(b)}</span></div>
        <div class="sd-row"><span class="sd-label">通关奖励</span><span class="sd-val">${fmt(bonus)}</span></div>`;
    if (nh) h += `<div class="sd-row"><span class="sd-label">无提示奖励</span><span class="sd-val">${fmt(nh)}</span></div>`;
    if (ne) h += `<div class="sd-row"><span class="sd-label">无错误奖励</span><span class="sd-val">${fmt(ne)}</span></div>`;
    if (t)  h += `<div class="sd-row"><span class="sd-label">时间奖励</span><span class="sd-val">${fmt(t)}</span></div>`;
    h += `
        <div class="sd-row"><span class="sd-label">用时</span><span class="sd-val">${S.fmtTime(S.state.timerSeconds)}</span></div>
        <div class="sd-row"><span class="sd-label">错误</span><span class="sd-val">${S.state.mistakes}</span></div>
        <div class="sd-row"><span class="sd-label">提示</span><span class="sd-val">${S.state.hintsUsed}</span></div>
        <div class="sd-row sd-total"><span class="sd-label">总分</span><span class="sd-val">${total}</span></div>`;
    return h;
};

S.saveGameHistory = (won, total) => {
    try {
        const h = JSON.parse(localStorage.getItem('sudoku-history') || '[]');
        h.unshift({ date: new Date().toISOString(), difficulty: S.state.difficulty,
            score: total, time: S.state.timerSeconds, mistakes: S.state.mistakes,
            hints: S.state.hintsUsed, won });
        if (h.length > 50) h.length = 50;
        localStorage.setItem('sudoku-history', JSON.stringify(h));
    } catch (e) {}
};


// ==============================================================
// 持久化
// ==============================================================

S.hasSavedGame = () => {
    try {
        const r = localStorage.getItem('sudoku-saved-game');
        if (!r) return false;
        return JSON.parse(r) && !JSON.parse(r).isGameOver;
    } catch (e) { return false; }
};

S.clearSavedGame = () => {
    try { localStorage.removeItem('sudoku-saved-game'); } catch (e) {}
};

S.saveGame = () => {
    if (S.state.isGameOver) return;
    const ser = (g) => g.map(row => row.map(s => [...s]));
    const data = {
        puzzle: S.state.puzzle, solution: S.state.solution,
        userGrid: S.state.userGrid,
        notes: ser(S.state.notes), userRemovedNotes: ser(S.state.userRemovedNotes),
        mistakes: S.state.mistakes, timerSeconds: S.state.timerSeconds,
        difficulty: S.state.difficulty, score: S.state.score, streak: S.state.streak,
        hintsUsed: S.state.hintsUsed, isCandidateEditMode: S.state.isCandidateEditMode,
    };
    try { localStorage.setItem('sudoku-saved-game', JSON.stringify(data)); } catch (e) {}
};

S.restoreGame = (saved) => {
    const deser = (d) => d.map(row => row.map(a => new Set(a)));
    S.stopTimer();
    S.state.puzzle = saved.puzzle;
    S.state.solution = saved.solution;
    S.state.userGrid = saved.userGrid;
    S.state.fixedCells = saved.puzzle.map(row => row.map(v => v !== 0));
    S.state.notes = deser(saved.notes);
    S.state.userRemovedNotes = deser(saved.userRemovedNotes);
    S.state.mistakes = saved.mistakes;
    S.state.timerSeconds = saved.timerSeconds;
    S.state.difficulty = saved.difficulty;
    S.state.score = saved.score;
    S.state.streak = saved.streak || 0;
    S.state.hintsUsed = saved.hintsUsed || 0;
    S.state.isCandidateEditMode = saved.isCandidateEditMode || false;
    S.state.isGameOver = false;
    S.state.selectedRow = -1;
    S.state.selectedCol = -1;

    S.el.autoMark.classList.remove('active');
    S.el.notesToggle.classList.toggle('active', S.state.isCandidateEditMode);
    S.el.timer.textContent = S.fmtTime(S.state.timerSeconds);
    S.el.mistakes.textContent = S.state.mistakes;
    S.updateScoreDisplay();
    S.el.hintCount.textContent = S.state.maxHints - S.state.hintsUsed;
    S.el.hintBtn.disabled = S.state.hintsUsed >= S.state.maxHints;
    S.el.diffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === S.state.difficulty));

    S.renderBoard();
    S.clearSavedGame();
    S.startTimer();
};


// ==============================================================
// 排行榜
// ==============================================================

S.renderLeaderboard = (filter = 'all') => {
    try {
        const hist = JSON.parse(localStorage.getItem('sudoku-history') || '[]');
        const f = filter === 'all' ? hist : hist.filter(e => e.difficulty === filter);

        S.el.lbFilters.querySelectorAll('.lb-filter').forEach(b => {
            b.classList.toggle('active', b.dataset.filter === filter);
        });

        const n = f.length;
        const best = n > 0 ? Math.max(...f.map(e => e.score)) : 0;
        const avg = n > 0 ? Math.round(f.reduce((s, e) => s + e.score, 0) / n) : 0;
        const totalT = f.reduce((s, e) => s + e.time, 0);
        const dur = (sec) => { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60); return h > 0 ? `${h}h${m}m` : `${m}m`; };
        const tm = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        const dt = (iso) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()}`; };

        document.getElementById('lbStats').innerHTML = `
            <div class="lb-stat"><div class="lb-stat-value">${n}</div><div class="lb-stat-label">局数</div></div>
            <div class="lb-stat"><div class="lb-stat-value best">${best}</div><div class="lb-stat-label">最高</div></div>
            <div class="lb-stat"><div class="lb-stat-value">${avg}</div><div class="lb-stat-label">平均</div></div>
            <div class="lb-stat"><div class="lb-stat-value">${dur(totalT)}</div><div class="lb-stat-label">总用时</div></div>`;

        if (n === 0) { S.el.lbList.innerHTML = '<p class="lb-empty">暂无游戏记录</p>'; return; }

        const sorted = [...f].sort((a, b) => b.score - a.score);
        let html = '';
        sorted.forEach((e, i) => {
            const r = i + 1;
            const rc = r === 1 ? 'top1' : r === 2 ? 'top2' : r === 3 ? 'top3' : '';
            html += `<div class="lb-entry">
                <span class="lb-rank ${rc}">${r}</span>
                <div class="lb-info">
                    <span class="lb-score ${rc}">${e.score}</span>
                    <span class="lb-meta"><span class="lb-diff">${DL[e.difficulty] || e.difficulty}</span>${dt(e.date)} · ${tm(e.time)}</span>
                </div>
                <span class="lb-time">${e.won ? '&#10003;' : '&#10007;'}</span>
            </div>`;
        });
        S.el.lbList.innerHTML = html;
    } catch (e) {
        S.el.lbList.innerHTML = '<p class="lb-empty">加载失败</p>';
    }
};

S.showLeaderboard = () => {
    S.renderLeaderboard('all');
    S.el.lbOverlay.classList.add('show');
};

})();
