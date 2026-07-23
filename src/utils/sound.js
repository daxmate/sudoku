// 音效模块 — Audio 文件播放 + Web Audio 合成回退
// 音效文件来源：Kenney.nl (CC0 许可)
// https://kenney.nl/assets/interface-sounds 等

const SOUNDS = {
  correct: '/sounds/correct.ogg',
  error: '/sounds/error.ogg',
  complete: '/sounds/complete.ogg',
  victory: '/sounds/victory.ogg',
  gameover: '/sounds/gameover.ogg',
}

// 缓存已加载的 Audio 对象
const cache = {}

function load(name) {
  if (cache[name]) return cache[name]
  const url = SOUNDS[name]
  if (!url) return null
  try {
    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = url
    cache[name] = audio
    return audio
  } catch (e) { return null }
}

function play(name) {
  try {
    const audio = new Audio(SOUNDS[name])
    audio.volume = 0.5
    audio.play().catch(() => {
      // 静默失败，fallback 到合成音
      const fallback = fallbacks[name]
      if (fallback) fallback()
    })
  } catch (e) {
    const fallback = fallbacks[name]
    if (fallback) fallback()
  }
}

// ---------- Web Audio API 合成音效（后备） ----------

let _ctx = null

function ctx() {
  if (!_ctx) { try { _ctx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) {} }
  return _ctx
}

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

const fallbacks = {
  correct() {
    const c = ctx(); if (!c) return
    const t = c.currentTime
    playTone(1046.5, t, 0.35, 0.07, 'sine', [[2, 0.3], [3, 0.15]])
    playTone(1318.5, t + 0.06, 0.3, 0.04, 'sine', [[2, 0.2]])
  },
  error() {
    const c = ctx(); if (!c) return
    const t = c.currentTime
    playTone(220, t, 0.3, 0.08, 'sawtooth')
    playTone(175, t + 0.06, 0.25, 0.05, 'sawtooth')
  },
  complete() {
    const c = ctx(); if (!c) return
    const t = c.currentTime
    ;[523.25, 659.25, 783.99].forEach((f, i) => playTone(f, t + i * 0.08, 0.33, 0.1, 'sine', [[2, 0.25]]))
  },
  victory() {
    const c = ctx(); if (!c) return
    const t = c.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, t + i * 0.12, 0.4, 0.12, 'sine', [[2, 0.3]]))
  },
  gameover() {
    const c = ctx(); if (!c) return
    const t = c.currentTime
    ;[523.25, 415.3, 349.23].forEach((f, i) => playTone(f, t + i * 0.15, 0.35, 0.07, 'triangle'))
    playTone(130.81, t + 0.35, 0.6, 0.08, 'sawtooth')
  },
}

export function playCorrectSound() { play('correct') }
export function playErrorSound() { play('error') }
export function playCompletionSound() { play('complete') }
export function playVictorySound() { play('victory') }
export function playGameOverSound() { play('gameover') }
