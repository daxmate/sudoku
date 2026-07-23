// Web Audio API 合成音效 — 增强版
// 使用谐波、滤波器、增益包络，远超简单 beep

let _ctx = null

function ctx() {
  if (!_ctx) { try { _ctx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) {} }
  return _ctx
}

/** 单音：支持泛音列（基频 + 倍频）实现丰富音色 */
function playTone(freq, time, dur, vol = 0.1, type = 'sine', harmonics = []) {
  const c = ctx()
  if (!c) return
  try {
    // 基音
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

    // 泛音
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

/** 延时尾音 — 模拟简单混响 */
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
  // 主干音（C6）
  playTone(1046.5, t, 0.35, 0.07, 'sine', [
    [2, 0.3, 'sine'],      // 第一泛音 — 温暖感
    [3, 0.15, 'sine'],     // 第二泛音 — 清脆感
    [5, 0.08, 'sine'],     // 第五泛音 — 金属感
  ])
  // 延迟尾音（E6），产生 "叮~铃" 的双音效果
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
    // 噪声底板
    const bufSize = c.sampleRate * 0.3
    const buf = c.createBuffer(1, bufSize, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4
    }
    const noise = c.createBufferSource()
    noise.buffer = buf

    // 低通滤波器 — 产生低沉嗡鸣感
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

    // 低频振荡 — 抖动感
    playTone(110, t, 0.3, 0.06, 'sawtooth')
    playTone(82, t + 0.04, 0.25, 0.04, 'sawtooth')
  } catch (e) { /* ignore */ }
}

/** 🎵 行/列/宫完成 — 三音上行琶音 + 混响尾音 */
export function playCompletionSound() {
  const c = ctx()
  if (!c) return
  const t = c.currentTime
  // C5 → E5 → G5 上行琶音
  ;[
    [523.25, 0, 0.4],      // C5
    [659.25, 0.1, 0.35],   // E5
    [783.99, 0.2, 0.3],    // G5
  ].forEach(([freq, offset, dur]) => {
    playTone(freq, t + offset, dur, 0.08, 'sine', [
      [2, 0.25, 'sine'],
      [3, 0.1, 'sine'],
    ])
  })
  // 尾音回响
  playEcho(783.99, t + 0.3, 0.5, 0.04, 'sine', 0.08, 0.35, 4)
}

/** 🏆 通关胜利 — 上行琶音 + 饱满和弦感 */
export function playVictorySound() {
  const c = ctx()
  if (!c) return
  const t = c.currentTime
  // C5 → E5 → G5 → C6 → E6 五音上行 + 和弦
  const notes = [
    [523.25, 0, 0.3],       // C5
    [659.25, 0.1, 0.35],   // E5
    [783.99, 0.2, 0.35],   // G5
    [1046.5, 0.3, 0.4],    // C6
    [1318.5, 0.4, 0.5],    // E6
  ]
  notes.forEach(([freq, offset, dur]) => {
    playTone(freq, t + offset, dur, 0.08, 'sine', [
      [2, 0.3, 'sine'],
      [3, 0.12, 'sine'],
      [4, 0.06, 'sine'],
    ])
  })
  // 最后一个音的长尾音
  playEcho(1318.5, t + 0.45, 0.8, 0.06, 'sine', 0.1, 0.3, 6)
}
