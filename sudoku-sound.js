// ==================================================================
// 音效模块 — Web Audio API 合成
// ==================================================================

(function() {
const S = window.S;

let _ctx = null;
const ctx = () => {
    if (!_ctx) try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    return _ctx;
};

S.playNote = (freq, time, dur, vol = 0.1, type = 'sine') => {
    const c = ctx();
    if (!c) return;
    try {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(time);
        osc.stop(time + dur + 0.05);
    } catch (e) {}
};

S.playCompletionSound = () => {
    const c = ctx();
    if (!c) return;
    try {
        const t = c.currentTime;
        [523.25, 659.25, 783.99].forEach((f, i) => S.playNote(f, t + i * 0.08, 0.33, 0.1, 'sine'));
    } catch (e) {}
};

S.playCorrectSound = () => {
    const c = ctx();
    if (!c) return;
    S.playNote(880, c.currentTime, 0.08, 0.06, 'sine');
};

S.playErrorSound = () => {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    S.playNote(220, t, 0.3, 0.08, 'sawtooth');
    S.playNote(175, t + 0.06, 0.25, 0.05, 'sawtooth');
};

S.playVictorySound = () => {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => S.playNote(f, t + i * 0.12, 0.4, 0.12, 'sine'));
};

})();
