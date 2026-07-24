import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './style.css'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

// Load saved locale, default to zh-CN
const savedLocale = localStorage.getItem('sudoku-locale') || 'zh-CN'

// Custom message compiler: handles {n} interpolation but treats all other braces as literal text
function simpleMessageCompiler(message) {
  if (typeof message !== 'string') return () => message
  // Match {word} patterns for simple parameter interpolation
  const parts = message.split(/\{([^}]+)\}/)
  if (parts.length === 1) return () => message
  return (ctx) => {
    let result = ''
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        result += parts[i]
      } else {
        result += ctx.named?.[parts[i]] ?? ctx.list?.[parseInt(parts[i])] ?? `{${parts[i]}}`
      }
    }
    return result
  }
}

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messageCompiler: simpleMessageCompiler,
  messages: {
    'zh-CN': zhCN,
    en,
    ja,
  },
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
