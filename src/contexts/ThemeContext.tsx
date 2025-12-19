import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 根据时间判断是否为白天
function isDaytime(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  
  // 6:30 - 18:30 为白天
  if ((hour > 6 || (hour === 6 && minute >= 30)) && (hour < 18 || (hour === 18 && minute < 30))) {
    return true
  }
  return false
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme
      return saved || 'system'
    }
    return 'system'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'light') {
        setActualTheme('light')
      } else if (theme === 'dark') {
        setActualTheme('dark')
      } else {
        // system 模式：根据时间判断
        setActualTheme(isDaytime() ? 'light' : 'dark')
      }
    }

    updateActualTheme()

    // 如果是 system 模式，每分钟检查一次时间
    let intervalId: number | undefined
    if (theme === 'system') {
      intervalId = window.setInterval(updateActualTheme, 60000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme, actualTheme])

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}