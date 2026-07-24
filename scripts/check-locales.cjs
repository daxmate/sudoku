// Check that all locale files have identical key structure
// Run before build to catch missing translations

const fs = require('fs')
const path = require('path')

const LOCALE_DIR = path.resolve(__dirname, '../src/locales')
const FILES = ['zh-CN.json', 'en.json', 'ja.json']

function getKeys(obj, prefix = '') {
  let keys = []
  for (const k of Object.keys(obj).sort()) {
    const v = obj[k]
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, p))
    } else if (Array.isArray(v)) {
      // For arrays, use index-based keys
      for (let i = 0; i < v.length; i++) {
        keys = keys.concat(getKeys(v[i], `${p}.${i}`))
      }
    } else {
      keys.push(p)
    }
  }
  return keys
}

const all = {}
for (const f of FILES) {
  try {
    const content = JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, f), 'utf8'))
    const keys = getKeys(content)
    all[f] = { keys: new Set(keys), count: keys.length }
  } catch (e) {
    console.error(`❌ ${f}: parse error -`, e.message)
    process.exit(1)
  }
}

// Compare each pair
let hasError = false
const langs = Object.keys(all)
for (let i = 0; i < langs.length; i++) {
  for (let j = i + 1; j < langs.length; j++) {
    const a = langs[i]
    const b = langs[j]
    const missingA = [...all[a].keys].filter(k => !all[b].keys.has(k))
    const missingB = [...all[b].keys].filter(k => !all[a].keys.has(k))
    if (missingA.length) {
      console.error(`❌ ${a} has keys missing from ${b}:`)
      missingA.forEach(k => console.error(`   - ${k}`))
      hasError = true
    }
    if (missingB.length) {
      console.error(`❌ ${b} has keys missing from ${a}:`)
      missingB.forEach(k => console.error(`   - ${k}`))
      hasError = true
    }
    if (!missingA.length && !missingB.length) {
      console.log(`✅ ${a} ↔ ${b}: ${all[a].count} keys match`)
    }
  }
}

if (hasError) {
  process.exit(1)
} else {
  console.log('🎉 All locale files have identical key structure')
}
