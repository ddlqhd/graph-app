import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

const THEME_KEY = 'graphsql-theme'

// 主题状态
const currentTheme = ref<Theme>('light')
const isDark = ref(false)

// 从localStorage读取保存的主题
const getSavedTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_KEY)
  return (saved as Theme) || 'auto'
}

// 保存主题到localStorage
const saveTheme = (theme: Theme) => {
  localStorage.setItem(THEME_KEY, theme)
}

// 检测系统主题偏好
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 应用主题到document
const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement

  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
    root.classList.add('dark')
    isDark.value = true
  } else {
    root.setAttribute('data-theme', 'light')
    root.classList.remove('dark')
    isDark.value = false
  }
}

// 更新实际应用的主题
const updateAppliedTheme = () => {
  let appliedTheme: 'light' | 'dark'

  if (currentTheme.value === 'auto') {
    appliedTheme = getSystemTheme()
  } else {
    appliedTheme = currentTheme.value
  }

  applyTheme(appliedTheme)
}

// 设置主题
const setTheme = (theme: Theme) => {
  currentTheme.value = theme
  saveTheme(theme)
  updateAppliedTheme()
}

// 切换主题
const toggleTheme = () => {
  const themes: Theme[] = ['light', 'dark', 'auto']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  setTheme(themes[nextIndex])
}

// 获取主题显示名称
const getThemeLabel = (theme: Theme): string => {
  const labels = {
    light: '浅色主题',
    dark: '深色主题',
    auto: '跟随系统'
  }
  return labels[theme]
}

// 监听系统主题变化
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleSystemThemeChange = () => {
    if (currentTheme.value === 'auto') {
      updateAppliedTheme()
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)

  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
}

// 初始化主题
const initTheme = () => {
  currentTheme.value = getSavedTheme()
  updateAppliedTheme()
  return setupSystemThemeListener()
}

// 组合式函数
export const useTheme = () => {
  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    getThemeLabel,
    initTheme
  }
}