// Web Audio API 合成音效
// 使用谐波、增益包络、滤波器，产生接近真实乐器的音色
// 零依赖，零文件加载

let _ctx = null

function ctx() {
  if (!_ctx) { try { _ctx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) {} }
  return _ctx
}

/** 单音 + 泛音列 */
function playTone(freq, time, dur, vol = 0.1, type = 'sine', harmonics = []) {
  const c = ctx()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(vol, time + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(time)
    osc.stop(time + dur + 0.05)
    harmonics.forEach(([ratio, hVol, hType]) => {
      const hOsc = c.createOscillator()
      const hGain = c.createGain()
      hOsc.type = hType || 'sine'
      hOsc.frequency.value = freq * ratio
      hGain.gain.setValueAtTime(0, time)
      hGain.gain.linearRampToValueAtTime(vol * hVol, time + 0.01)
      hGain.gain.exponentialRampToValueAtTime(0.001, time + dur)
      hOsc.connect(hGain)
      hGain.connect(c.destination)
      hOsc.start(time)
      hOsc.stop(time + dur + 0.05)
    })
  } catch (e) { /* ignore */ }
}

/** 延时尾音 — 模拟混响 */
function playEcho(freq, time, dur, vol, type, delay = 0.06, decay = 0.4, count = 3) {
  for (let i = 0; i < count; i++) {
    playTone(freq, time + i * delay, dur, vol * Math.pow(decay, i), type)
  }
}

/** ✨ 填对 — 玻璃风铃感 */
export function playCorrectSound() {
  const c = ctx()
  if (!c) return
  const t = c.currentTime
  playTone(1046.5, t, 0.35, 0.07, 'sine', [
    [2, 0.3, 'sine'],
    [3, 0.15, 'sine'],
    [5, 0.08, 'sine'],
  ])
  playTone(1318.5, t + 0.06, 0.3, 0.04, 'sine', [
    [2, 0.2, 'sine'],
  ])
}

/** 💥 填错 — 低频嗡鸣 + 滤波器扫频 */
export function playErrorSound() {
  const c = ctx()
  if (!c) return
  try {
    const t = c.currentTime
    const bufSize = c.sampleRate * 0.3
    const buf = c.createBuffer(1, bufSize, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4
    const noise = c.createBufferSource()
    noise.buffer = buf
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, t)
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.25)
    filter.Q.value = 2
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.08, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)
    noise.start(t)
    noise.stop(t + 0.35)
    playTone(110, t, 0.3, 0.06, 'sawtooth')
    playTone(82, t + 0.04, 0.25, 0.04, 'sawtooth')
  } catch (e) { /* ignore */ }
}

/** 🎵 行/列/宫完成 — 上行琶音 + 尾音回响 */
export function playCompletionSound() {
  const c = ctx()
  if (!c) return
  const t = c.currentTime
  ;[
    [523.25, 0, 0.4],
    [659.25, 0.1, 0.35],
    [783.99, 0.2, 0.3],
  ].forEach(([freq, offset, dur]) => {
    playTone(freq, t + offset, dur, 0.08, 'sine', [
      [2, 0.25, 'sine'],
      [3, 0.1, 'sine'],
    ])
  })
  playEcho(783.99, t + 0.3, 0.5, 0.04, 'sine', 0.08, 0.35, 4)
}

/** 🏆 通关胜利 — 上行琶音 + 饱满和弦感 */
export function playVictorySound() {
  const c = ctx()
  if (!c) return
  const t = c.currentTime
  const notes = [
    [523.25, 0, 0.3],
    [659.25, 0.1, 0.35],
    [783.99, 0.2, 0.35],
    [1046.5, 0.3, 0.4],
    [1318.5, 0.4, 0.5],
  ]
  notes.forEach(([freq, offset, dur]) => {
    playTone(freq, t + offset, dur, 0.08, 'sine', [
      [2, 0.3, 'sine'],
      [3, 0.12, 'sine'],
      [4, 0.06, 'sine'],
    ])
  })
  playEcho(1318.5, t + 0.45, 0.8, 0.06, 'sine', 0.1, 0.3, 6)
}

/** 😵 游戏失败 — 下行滑音 + 低音落幕 */
export function playGameOverSound() {
  const c = ctx()
  if (!c) return
  const t = c.currentTime
  ;[
    [523.25, 0, 0.35],
    [415.3, 0.15, 0.35],
    [349.23, 0.3, 0.4],
  ].forEach(([freq, offset, dur]) => {
    playTone(freq, t + offset, dur, 0.07, 'triangle')
  })
  playTone(130.81, t + 0.35, 0.6, 0.08, 'sawtooth')
}
