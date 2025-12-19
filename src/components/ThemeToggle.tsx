import { IoSunny, IoMoon, IoTime } from 'react-icons/io5'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light' as const, icon: IoSunny, label: '浅色' },
    { value: 'dark' as const, icon: IoMoon, label: '深色' },
    { value: 'system' as const, icon: IoTime, label: '自动' },
  ]

  return (
    <div 
      className="flex rounded-xl p-1"
      style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            backgroundColor: theme === value ? 'var(--color-bg-secondary)' : 'transparent',
            color: theme === value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            boxShadow: theme === value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
          title={value === 'system' ? '根据时间自动切换 (6:30-18:30 浅色)' : label}
        >
          <Icon size={16} />
          <span className="hidden xs:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}