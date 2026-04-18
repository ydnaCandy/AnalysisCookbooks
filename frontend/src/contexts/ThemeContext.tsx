import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeName = 'retro' | 'modern' | 'italian'

interface ThemeVars {
  [key: string]: string
}

const THEMES: Record<ThemeName, ThemeVars> = {
  retro: {
    '--theme-bg-base': '#D8D8D8',
    '--theme-bg-surface': '#ECECEC',
    '--theme-bg-sunken': '#C0C0C0',
    '--theme-border': '#333333',
    '--theme-border-soft': '#A0A0A0',
    '--theme-shadow': '#525252',
    '--theme-text': '#333333',
    '--theme-text-muted': '#525252',
    '--theme-header-bg': '#333333',
    '--theme-header-text': '#f9ca24',
    '--theme-sidebar-bg': '#1a1a1a',
    '--theme-sidebar-border': '#444444',
    '--theme-sidebar-text': '#cccccc',
    '--theme-sidebar-text-active': '#f9ca24',
    '--theme-sidebar-text-muted': '#525252',
    '--theme-sidebar-active-bg': '#000000',
    '--theme-sidebar-user-bg': '#111111',
    '--theme-accent': '#2ecc71',
    '--theme-accent-dark': '#1a8a4a',
    '--theme-accent-text': '#ffffff',
    '--theme-font': 'monospace',
    '--theme-font-display': "'Press Start 2P', monospace",
  },
  modern: {
    '--theme-bg-base': '#F5F5F5',
    '--theme-bg-surface': '#FFFFFF',
    '--theme-bg-sunken': '#EFEFEF',
    '--theme-border': '#E0E0E0',
    '--theme-border-soft': '#E0E0E0',
    '--theme-shadow': '#BDBDBD',
    '--theme-text': '#1A1A1A',
    '--theme-text-muted': '#757575',
    '--theme-header-bg': '#1A1A1A',
    '--theme-header-text': '#FFFFFF',
    '--theme-sidebar-bg': '#EFEFEF',
    '--theme-sidebar-border': '#E0E0E0',
    '--theme-sidebar-text': '#555555',
    '--theme-sidebar-text-active': '#2563EB',
    '--theme-sidebar-text-muted': '#9E9E9E',
    '--theme-sidebar-active-bg': '#E0E8FF',
    '--theme-sidebar-user-bg': '#E0E0E0',
    '--theme-accent': '#2563EB',
    '--theme-accent-dark': '#1D4ED8',
    '--theme-accent-text': '#FFFFFF',
    '--theme-font': "'Noto Sans JP', sans-serif",
    '--theme-font-display': "'Noto Sans JP', sans-serif",
  },
  italian: {
    '--theme-bg-base': '#FAFAF8',
    '--theme-bg-surface': '#FFFFFF',
    '--theme-bg-sunken': '#F2F0EB',
    '--theme-border': '#D4C5B0',
    '--theme-border-soft': '#D4C5B0',
    '--theme-shadow': '#B8A898',
    '--theme-text': '#3A3A3A',
    '--theme-text-muted': '#7A7A7A',
    '--theme-header-bg': '#2D6A4F',
    '--theme-header-text': '#FFFFFF',
    '--theme-sidebar-bg': '#2D6A4F',
    '--theme-sidebar-border': '#3D8A64',
    '--theme-sidebar-text': '#D4EDE0',
    '--theme-sidebar-text-active': '#FFFFFF',
    '--theme-sidebar-text-muted': '#8FBD9F',
    '--theme-sidebar-active-bg': '#1E5038',
    '--theme-sidebar-user-bg': '#236040',
    '--theme-accent': '#C0392B',
    '--theme-accent-dark': '#922B21',
    '--theme-accent-text': '#FFFFFF',
    '--theme-font': "'Noto Sans JP', sans-serif",
    '--theme-font-display': "'Playfair Display', serif",
  },
}

function applyTheme(name: ThemeName) {
  const vars = THEMES[name]
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (name: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'retro',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme') as ThemeName | null
    return saved && saved in THEMES ? saved : 'retro'
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = (name: ThemeName) => {
    setThemeState(name)
    localStorage.setItem('theme', name)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
