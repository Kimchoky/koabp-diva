import {useState, useEffect, createContext, ReactNode, useContext} from 'react'

type ThemeType = 'dark' | 'light'

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('dark')

  useEffect(() => {
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme')
    // 'light', 'dark' 에 대해 적용. 디폴트 = dark
    const newTheme = savedTheme === 'dark' ? 'dark' : savedTheme === 'light' ? 'light' : 'dark'
    setTheme(newTheme);

    // HTML 클래스 설정
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme)

    // HTML 클래스 토글
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const ThemeToggleButton = () => (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors z-50"
      aria-label="테마 전환"
    >
      {theme === 'dark' ? '🌙' : '☀'}
    </button>
  )

  const contextValue = {
    theme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}