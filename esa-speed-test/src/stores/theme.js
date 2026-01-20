import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式：light 或 dark
  const isDark = ref(false)

  // 切换主题
  function toggleTheme() {
    isDark.value = !isDark.value
    // 保存到 localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // 设置主题
  function setTheme(theme) {
    isDark.value = theme === 'dark'
    localStorage.setItem('theme', theme)
  }

  // 初始化主题（从 localStorage 读取）
  function initTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
    initTheme
  }
})