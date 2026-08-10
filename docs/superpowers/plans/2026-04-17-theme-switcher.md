# テーマ切り替え機能 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** アプリのカラーパレット・フォントを Retro / Modern / Italian の3テーマから切り替えられる機能を追加する。

**Architecture:** CSS変数をReact Contextで管理する。`ThemeContext`がlocalStorageからテーマを読み込み、`document.documentElement.style.setProperty()`で`:root`のCSS変数を上書き。コンポーネントは`var(--theme-xxx)`を参照する。

**Tech Stack:** React 18, TypeScript, CSS Custom Properties, localStorage

---

## ファイル一覧

| 操作 | ファイル |
|------|---------|
| 修正 | `frontend/src/index.css` |
| 新規 | `frontend/src/contexts/ThemeContext.tsx` |
| 修正 | `frontend/src/App.tsx` |
| 修正 | `frontend/src/components/layout/AppLayout.tsx` |
| 修正 | `frontend/src/components/layout/Sidebar.tsx` |
| 修正 | `frontend/src/components/layout/StatusBar.tsx` |
| 修正 | `frontend/src/components/recipes/RecipeCard.tsx` |
| 修正 | `frontend/src/components/recipes/RecipeGrid.tsx` |
| 修正 | `frontend/src/pages/LoginPage.tsx` |
| 修正 | `frontend/src/components/modals/RecipeModal.tsx` |
| 修正 | `frontend/src/components/modals/AdminModal.tsx` |
| 修正 | `frontend/src/components/modals/CommentThread.tsx` |
| 修正 | `frontend/src/components/modals/ErDiagramModal.tsx` |

---

## Task 1: index.css にフォント追加・CSS変数定義

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: index.css を以下の内容に書き換える**

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Noto+Sans+JP:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap');
@import "tailwindcss";

* {
  box-sizing: border-box;
}

:root {
  /* ページ・パネル背景 */
  --theme-bg-base: #D8D8D8;
  --theme-bg-surface: #ECECEC;
  --theme-bg-sunken: #C0C0C0;

  /* ボーダー・シャドウ */
  --theme-border: #333333;
  --theme-border-soft: #A0A0A0;
  --theme-shadow: #525252;

  /* テキスト */
  --theme-text: #333333;
  --theme-text-muted: #525252;

  /* ヘッダーバー（タイトルバー・カードヘッダー・モーダルヘッダー） */
  --theme-header-bg: #333333;
  --theme-header-text: #f9ca24;

  /* サイドバー */
  --theme-sidebar-bg: #1a1a1a;
  --theme-sidebar-border: #444444;
  --theme-sidebar-text: #cccccc;
  --theme-sidebar-text-active: #f9ca24;
  --theme-sidebar-text-muted: #525252;
  --theme-sidebar-active-bg: #000000;
  --theme-sidebar-user-bg: #111111;

  /* アクセント */
  --theme-accent: #2ecc71;
  --theme-accent-dark: #1a8a4a;
  --theme-accent-text: #ffffff;

  /* フォント */
  --theme-font: monospace;
  --theme-font-display: 'Press Start 2P', monospace;
}

body {
  margin: 0;
  font-family: var(--theme-font);
  background-color: var(--theme-bg-base);
  color: var(--theme-text);
}

/* ピクセルシャドウ（RPG枠） */
.rpg-border {
  border: 3px solid var(--theme-border);
  box-shadow: 4px 4px 0 var(--theme-shadow);
}

.rpg-border-sm {
  border: 2px solid var(--theme-border);
  box-shadow: 2px 2px 0 var(--theme-shadow);
}

/* Raised border (Win95風) */
.raised {
  border: 2px solid;
  border-color: #fff var(--theme-shadow) var(--theme-shadow) #fff;
}

/* ゲームフォント */
.font-game {
  font-family: var(--theme-font-display);
}
```

- [ ] **Step 2: 動作確認**

`frontend` ディレクトリで dev server が起動しているなら、ページがクラッシュしていないことを確認。

---

## Task 2: ThemeContext を作成

**Files:**
- Create: `frontend/src/contexts/ThemeContext.tsx`

- [ ] **Step 1: `frontend/src/contexts/` ディレクトリを作成して ThemeContext.tsx を作る**

```tsx
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
```

- [ ] **Step 2: TypeScript エラーがないことを確認**

```bash
cd /workspace/frontend && npx tsc --noEmit 2>&1 | head -30
```

---

## Task 3: App.tsx に ThemeProvider を追加

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: App.tsx を書き換える**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import RecipesPage from './pages/RecipesPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RecipesPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
```

- [ ] **Step 2: コミット**

```bash
cd /workspace && git add frontend/src/index.css frontend/src/contexts/ThemeContext.tsx frontend/src/App.tsx
git commit -m "feat: ThemeContext追加・CSS変数定義・フォント読み込み"
```

---

## Task 4: AppLayout.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/layout/AppLayout.tsx`

- [ ] **Step 1: AppLayout.tsx を書き換える**

```tsx
import type { ReactNode } from 'react'

interface AppLayoutProps {
  sidebar: ReactNode
  toolbar: ReactNode
  children: ReactNode
  statusBar: ReactNode
}

export default function AppLayout({ sidebar, toolbar, children, statusBar }: AppLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* タイトルバー */}
      <div
        style={{
          background: 'var(--theme-header-bg)',
          color: 'var(--theme-header-text)',
          padding: '8px 16px',
          fontFamily: 'var(--theme-font-display)',
          fontSize: 22,
          letterSpacing: 3,
          borderBottom: '3px solid var(--theme-shadow)',
          flexShrink: 0,
        }}
      >
        ** ANALYSIS COOKBOOKS **
      </div>

      {/* ボディ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sidebar}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--theme-bg-base)',
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        >
          {toolbar}
          <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
          {statusBar}
        </div>
      </div>
    </div>
  )
}
```

---

## Task 5: Sidebar.tsx をCSS変数化 + テーマ切り替えUI追加

**Files:**
- Modify: `frontend/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Sidebar.tsx を書き換える**

```tsx
import { useAuth } from '../../hooks/useAuth'
import { useTheme, type ThemeName } from '../../contexts/ThemeContext'
import type { Domain } from '../../types'

interface SidebarProps {
  domains: Domain[]
  selectedDomainId: number | null
  onSelectDomain: (id: number | null) => void
  onOpenAdmin: () => void
}

const THEME_BUTTONS: { name: ThemeName; label: string }[] = [
  { name: 'retro', label: 'RPG' },
  { name: 'modern', label: 'MOD' },
  { name: 'italian', label: 'ITA' },
]

const DOMAIN_COLORS: Record<string, string> = {
  製造: '#2ecc71',
  営業: '#f9ca24',
  経営: '#0984e3',
}

export default function Sidebar({ domains, selectedDomainId, onSelectDomain, onOpenAdmin }: SidebarProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const itemStyle = (active: boolean): React.CSSProperties => ({
    padding: '11px 14px',
    fontFamily: 'var(--theme-font-display)',
    fontSize: 14,
    color: active ? 'var(--theme-sidebar-text-active)' : 'var(--theme-sidebar-text)',
    background: active ? 'var(--theme-sidebar-active-bg)' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    letterSpacing: 1,
    borderBottom: '1px solid var(--theme-sidebar-border)',
  })

  return (
    <div
      style={{
        width: 260,
        background: 'var(--theme-sidebar-bg)',
        borderRight: '3px solid var(--theme-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* メニュー */}
      <div style={{ padding: '8px 0', borderBottom: '2px solid var(--theme-sidebar-border)' }}>
        <div
          style={{
            fontFamily: 'var(--theme-font-display)',
            fontSize: 12,
            color: 'var(--theme-sidebar-text-muted)',
            padding: '8px 14px 10px',
            letterSpacing: 2,
          }}
        >
          - MENU -
        </div>
        <div style={itemStyle(true)}>
          <span style={{ color: 'var(--theme-sidebar-text-active)' }}>&#9658;</span> レシピ一覧
        </div>
        {user?.is_admin && (
          <div style={itemStyle(false)} onClick={onOpenAdmin}>
            <span style={{ color: 'var(--theme-sidebar-text-muted)' }}>&nbsp;</span> 管理者メニュー
          </div>
        )}
      </div>

      {/* ドメインフィルタ */}
      <div style={{ padding: '8px 0', flex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--theme-font-display)',
            fontSize: 12,
            color: 'var(--theme-sidebar-text-muted)',
            padding: '8px 14px 10px',
            letterSpacing: 2,
          }}
        >
          - DOMAIN -
        </div>
        <div
          style={itemStyle(selectedDomainId === null)}
          onClick={() => onSelectDomain(null)}
        >
          <span style={{ color: selectedDomainId === null ? 'var(--theme-sidebar-text-active)' : 'var(--theme-sidebar-text-muted)' }}>
            {selectedDomainId === null ? '►' : '\u00A0'}
          </span>
          すべて
        </div>
        {domains.map((d) => (
          <div
            key={d.id}
            style={itemStyle(selectedDomainId === d.id)}
            onClick={() => onSelectDomain(d.id)}
          >
            <span style={{ color: DOMAIN_COLORS[d.name] ?? 'var(--theme-sidebar-text-muted)', fontSize: 10 }}>&#9632;</span>
            {d.name}
          </div>
        ))}
      </div>

      {/* テーマ切り替え */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '2px solid var(--theme-sidebar-border)',
          display: 'flex',
          gap: 6,
          justifyContent: 'center',
        }}
      >
        {THEME_BUTTONS.map(({ name, label }) => (
          <button
            key={name}
            onClick={() => setTheme(name)}
            style={{
              fontFamily: 'var(--theme-font-display)',
              fontSize: 9,
              padding: '5px 8px',
              border: '2px solid var(--theme-sidebar-border)',
              background: theme === name ? 'var(--theme-sidebar-text-active)' : 'transparent',
              color: theme === name ? 'var(--theme-sidebar-bg)' : 'var(--theme-sidebar-text)',
              cursor: 'pointer',
              letterSpacing: 1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ユーザー情報 */}
      <div
        style={{
          background: 'var(--theme-sidebar-user-bg)',
          padding: '12px 14px',
          fontFamily: 'var(--theme-font-display)',
          fontSize: 12,
          color: 'var(--theme-sidebar-text)',
          lineHeight: 2,
          borderTop: '2px solid var(--theme-sidebar-border)',
        }}
      >
        <div>PLAYER:</div>
        <div style={{ color: 'var(--theme-sidebar-text-active)' }}>{user?.username}</div>
        {user?.is_admin && <div style={{ color: 'var(--theme-sidebar-text-active)' }}>★ ADMIN</div>}
        <div
          style={{ color: '#d63031', cursor: 'pointer', marginTop: 4 }}
          onClick={logout}
        >
          [ LOGOUT ]
        </div>
      </div>
    </div>
  )
}
```

---

## Task 6: StatusBar.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/layout/StatusBar.tsx`

- [ ] **Step 1: StatusBar.tsx を書き換える**

```tsx
interface StatusBarProps {
  count: number
  filterLabel: string
}

export default function StatusBar({ count, filterLabel }: StatusBarProps) {
  return (
    <div
      style={{
        background: 'var(--theme-header-bg)',
        padding: '4px 12px',
        fontFamily: 'var(--theme-font-display)',
        fontSize: 10,
        color: 'var(--theme-header-text)',
        display: 'flex',
        gap: 16,
        letterSpacing: 1,
        borderTop: '3px solid var(--theme-shadow)',
        flexShrink: 0,
      }}
    >
      <span>{count} RECIPES FOUND</span>
      <span style={{ color: 'var(--theme-shadow)' }}>|</span>
      <span>FILTER: {filterLabel}</span>
      <span style={{ color: 'var(--theme-shadow)' }}>|</span>
      <span>VER 1.0.0</span>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
cd /workspace && git add frontend/src/components/layout/
git commit -m "feat: レイアウトコンポーネントをCSS変数化・テーマ切り替えUI追加"
```

---

## Task 7: RecipeCard.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/recipes/RecipeCard.tsx`

- [ ] **Step 1: RecipeCard.tsx を書き換える**

```tsx
import type { Recipe } from '../../types'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

const DOMAIN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  営業: { bg: '#f9ca24', border: '#c9a010', text: '#333' },
  製造: { bg: '#2ecc71', border: '#1a8a4a', text: '#fff' },
  経営: { bg: '#0984e3', border: '#055a9a', text: '#fff' },
}

const TAG_COLORS = ['#0984e3', '#2ecc71', '#d63031', '#f9ca24']

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const domainColor = recipe.domain
    ? DOMAIN_COLORS[recipe.domain.name] ?? { bg: 'var(--theme-shadow)', border: 'var(--theme-border)', text: '#fff' }
    : { bg: 'var(--theme-shadow)', border: 'var(--theme-border)', text: '#fff' }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--theme-bg-surface)',
        border: '3px solid var(--theme-border)',
        boxShadow: '4px 4px 0 var(--theme-shadow)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.05s, box-shadow 0.05s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px, -2px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0 var(--theme-shadow)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translate(0, 0)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0 var(--theme-shadow)'
      }}
    >
      {/* カードヘッダー */}
      <div
        style={{
          background: 'var(--theme-header-bg)',
          padding: '5px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--theme-font-display)',
            fontSize: 18,
            color: 'var(--theme-header-text)',
            letterSpacing: 1,
          }}
        >
          {recipe.title}
        </span>
        {recipe.domain && (
          <span
            style={{
              fontFamily: 'var(--theme-font-display)',
              fontSize: 11,
              padding: '3px 7px',
              background: domainColor.bg,
              color: domainColor.text,
              border: `1px solid ${domainColor.border}`,
            }}
          >
            {recipe.domain.name}
          </span>
        )}
      </div>

      {/* カードボディ */}
      <div style={{ padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
        {recipe.description && (
          <div
            style={{
              fontFamily: 'var(--theme-font)',
              fontSize: 15,
              color: 'var(--theme-text-muted)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {recipe.description}
          </div>
        )}
        {/* タグ */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {recipe.tags.map((tag, i) => (
            <span
              key={tag.id}
              style={{
                fontFamily: 'var(--theme-font-display)',
                fontSize: 11,
                padding: '3px 7px',
                background: TAG_COLORS[i % TAG_COLORS.length],
                color: i === 3 ? '#333' : '#fff',
                border: '2px solid var(--theme-border)',
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* カードフッター */}
      <div
        style={{
          background: 'var(--theme-bg-sunken)',
          borderTop: '2px solid var(--theme-border-soft)',
          padding: '4px 8px',
          fontFamily: 'var(--theme-font-display)',
          fontSize: 11,
          color: 'var(--theme-text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          by {recipe.created_by_user?.username ?? '?'}
        </span>
        <span style={{ flexShrink: 0, marginLeft: 4 }}>{recipe.updated_at.slice(0, 10)}</span>
      </div>
    </div>
  )
}
```

---

## Task 8: RecipeGrid.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/recipes/RecipeGrid.tsx`

- [ ] **Step 1: RecipeGrid.tsx を書き換える**

```tsx
import type { Domain, Tag, Recipe } from '../../types'
import RecipeCard from './RecipeCard'

interface RecipeGridProps {
  recipes: Recipe[]
  domains: Domain[]
  tags: Tag[]
  selectedDomainId: number | null
  selectedTagId: number | null
  onSelectDomain: (id: number | null) => void
  onSelectTag: (id: number | null) => void
  onClickRecipe: (recipe: Recipe) => void
  onClickNew: () => void
}

const btnStyle: React.CSSProperties = {
  background: 'var(--theme-accent)',
  color: 'var(--theme-accent-text)',
  border: '2px solid var(--theme-border)',
  boxShadow: '3px 3px 0 var(--theme-accent-dark)',
  padding: '6px 12px',
  fontFamily: 'var(--theme-font-display)',
  fontSize: 12,
  cursor: 'pointer',
  letterSpacing: 1,
}

const selectStyle: React.CSSProperties = {
  background: 'var(--theme-bg-surface)',
  border: '2px solid var(--theme-border)',
  boxShadow: '2px 2px 0 var(--theme-shadow)',
  padding: '6px 10px',
  fontFamily: 'var(--theme-font-display)',
  fontSize: 12,
  color: 'var(--theme-text)',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--theme-font-display)',
  fontSize: 11,
  color: 'var(--theme-text-muted)',
  letterSpacing: 1,
}

export default function RecipeGrid({
  recipes,
  domains,
  tags,
  selectedDomainId,
  selectedTagId,
  onSelectDomain,
  onSelectTag,
  onClickRecipe,
  onClickNew,
}: RecipeGridProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ツールバー */}
      <div
        style={{
          background: 'var(--theme-bg-sunken)',
          padding: '8px 12px',
          borderBottom: '3px solid var(--theme-shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span style={labelStyle}>DOMAIN</span>
        <select
          style={selectStyle}
          value={selectedDomainId ?? ''}
          onChange={(e) => onSelectDomain(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">ALL</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <span style={labelStyle}>TAG</span>
        <select
          style={selectStyle}
          value={selectedTagId ?? ''}
          onChange={(e) => onSelectTag(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">ALL</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />
        <button style={btnStyle} onClick={onClickNew}>
          [ + NEW RECIPE ]
        </button>
      </div>

      {/* カードグリッド */}
      <div
        style={{
          flex: 1,
          padding: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          alignContent: 'start',
          overflowY: 'auto',
        }}
      >
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onClickRecipe(recipe)} />
        ))}
        {recipes.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              fontFamily: 'var(--theme-font-display)',
              fontSize: 10,
              color: 'var(--theme-border-soft)',
              padding: 40,
            }}
          >
            NO RECIPES FOUND
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
cd /workspace && git add frontend/src/components/recipes/
git commit -m "feat: レシピカード・グリッドをCSS変数化"
```

---

## Task 9: LoginPage.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`

- [ ] **Step 1: LoginPage.tsx を書き換える**

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { loginMutation } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await loginMutation.mutateAsync({ username, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--theme-bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '8px 8px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* タイトル */}
        <div
          style={{
            fontFamily: 'var(--theme-font-display)',
            fontSize: 14,
            color: 'var(--theme-text)',
            textAlign: 'center',
            lineHeight: 2,
          }}
        >
          ** ANALYSIS **
          <br />
          ** COOKBOOKS **
        </div>

        {/* ログインボックス */}
        <div
          style={{
            background: 'var(--theme-bg-surface)',
            border: '3px solid var(--theme-border)',
            boxShadow: '4px 4px 0 var(--theme-shadow)',
            padding: 0,
            width: 300,
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              background: 'var(--theme-header-bg)',
              color: 'var(--theme-header-text)',
              fontFamily: 'var(--theme-font-display)',
              fontSize: 10,
              padding: '8px 12px',
              letterSpacing: 2,
            }}
          >
            - LOGIN -
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: 'var(--theme-font-display)', fontSize: 8, color: 'var(--theme-text-muted)' }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  background: '#fff',
                  border: '2px solid var(--theme-border)',
                  boxShadow: 'inset 2px 2px 0 var(--theme-border-soft)',
                  padding: '6px 8px',
                  fontFamily: 'var(--theme-font)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: 'var(--theme-font-display)', fontSize: 8, color: 'var(--theme-text-muted)' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  background: '#fff',
                  border: '2px solid var(--theme-border)',
                  boxShadow: 'inset 2px 2px 0 var(--theme-border-soft)',
                  padding: '6px 8px',
                  fontFamily: 'var(--theme-font)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  fontFamily: 'var(--theme-font)',
                  fontSize: 11,
                  color: '#d63031',
                  background: '#ffe0e0',
                  border: '1px solid #d63031',
                  padding: '4px 8px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                background: loginMutation.isPending ? 'var(--theme-border-soft)' : 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
                border: '2px solid var(--theme-border)',
                boxShadow: loginMutation.isPending ? 'none' : '3px 3px 0 var(--theme-accent-dark)',
                padding: '8px 12px',
                fontFamily: 'var(--theme-font-display)',
                fontSize: 9,
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
              }}
            >
              {loginMutation.isPending ? 'LOADING...' : '[ LOGIN ]'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
cd /workspace && git add frontend/src/pages/LoginPage.tsx
git commit -m "feat: ログインページをCSS変数化"
```

---

## Task 10: RecipeModal.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/modals/RecipeModal.tsx`

- [ ] **Step 1: RecipeModal.tsx を書き換える**

```tsx
import { useState, useEffect } from 'react'
import type { Domain, Tag, Recipe } from '../../types'
import { useRecipeMutations } from '../../hooks/useRecipes'
import CommentThread from './CommentThread'
import ErDiagramModal from './ErDiagramModal'

interface Props {
  recipe: Recipe | null
  domains: Domain[]
  tags: Tag[]
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  background: '#fff',
  border: '2px solid var(--theme-border)',
  boxShadow: 'inset 2px 2px 0 var(--theme-border-soft)',
  padding: '8px 10px',
  fontFamily: 'var(--theme-font)',
  fontSize: 16,
  outline: 'none',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--theme-font-display)',
  fontSize: 12,
  color: 'var(--theme-text-muted)',
  marginBottom: 4,
  display: 'block',
}

const btnBase: React.CSSProperties = {
  border: '2px solid var(--theme-border)',
  padding: '8px 16px',
  fontFamily: 'var(--theme-font-display)',
  fontSize: 11,
  cursor: 'pointer',
  letterSpacing: 1,
}

export default function RecipeModal({ recipe, domains, tags, onClose }: Props) {
  const { create, update, remove } = useRecipeMutations()
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [sqlText, setSqlText] = useState(recipe?.sql_text ?? '')
  const [domainId, setDomainId] = useState<number>(recipe?.domain_id ?? (domains[0]?.id ?? 0))
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    recipe?.tags.map((t) => t.id) ?? []
  )
  const [showErModal, setShowErModal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title)
      setDescription(recipe.description ?? '')
      setSqlText(recipe.sql_text)
      setDomainId(recipe.domain_id)
      setSelectedTagIds(recipe.tags.map((t) => t.id))
    }
  }, [recipe])

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim() || !sqlText.trim() || !domainId) {
      setError('タイトル・SQL・ドメインは必須です')
      return
    }
    try {
      if (recipe) {
        await update.mutateAsync({ id: recipe.id, data: { title, description, sql_text: sqlText, domain_id: domainId, tag_ids: selectedTagIds } })
      } else {
        await create.mutateAsync({ title, description, sql_text: sqlText, domain_id: domainId, tag_ids: selectedTagIds })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!recipe) return
    if (!confirm(`「${recipe.title}」を削除しますか？`)) return
    try {
      await remove.mutateAsync(recipe.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }}
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          width: '98vw',
          height: '97vh',
          maxWidth: '98vw',
          maxHeight: '97vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--theme-bg-surface)',
          border: '3px solid var(--theme-border)',
          boxShadow: '6px 6px 0 var(--theme-shadow)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: 'var(--theme-header-bg)',
            color: 'var(--theme-header-text)',
            fontFamily: 'var(--theme-font-display)',
            fontSize: 14,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span>{recipe ? `EDIT: ${recipe.title}` : 'NEW RECIPE'}</span>
          <span style={{ cursor: 'pointer', color: '#d63031' }} onClick={onClose}>[ X ]</span>
        </div>

        {/* ボディ */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* 左カラム */}
          <div
            style={{
              flex: 1,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              overflowY: 'auto',
              borderRight: '2px solid var(--theme-border-soft)',
            }}
          >
            <div>
              <label style={labelStyle}>TITLE *</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>DOMAIN *</label>
              <select
                style={{ ...inputStyle }}
                value={domainId}
                onChange={(e) => setDomainId(Number(e.target.value))}
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>TAGS</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id)
                  return (
                    <span
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        fontFamily: 'var(--theme-font-display)',
                        fontSize: 9,
                        padding: '4px 8px',
                        border: '2px solid var(--theme-border)',
                        background: selected ? '#0984e3' : 'var(--theme-bg-sunken)',
                        color: selected ? '#fff' : 'var(--theme-text)',
                        cursor: 'pointer',
                      }}
                    >
                      {tag.name}
                    </span>
                  )
                })}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>DESCRIPTION / NOTES</label>
              <textarea
                style={{ ...inputStyle, flex: 1, resize: 'none', minHeight: 80 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* ボタン */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                style={{ ...btnBase, background: 'var(--theme-accent)', color: 'var(--theme-accent-text)', boxShadow: '3px 3px 0 var(--theme-accent-dark)' }}
                onClick={handleSave}
                disabled={create.isPending || update.isPending}
              >
                [ SAVE ]
              </button>
              {recipe && (
                <button
                  style={{ ...btnBase, background: '#d63031', color: '#fff', boxShadow: '3px 3px 0 #8a1010' }}
                  onClick={handleDelete}
                >
                  [ DELETE ]
                </button>
              )}
              <button
                style={{ ...btnBase, background: '#0984e3', color: '#fff', boxShadow: '3px 3px 0 #055a9a' }}
                onClick={() => setShowErModal(true)}
                disabled={!sqlText.trim()}
              >
                [ ER ]
              </button>
            </div>

            {error && (
              <div style={{ fontFamily: 'var(--theme-font)', fontSize: 14, color: '#d63031', background: '#ffe0e0', border: '1px solid #d63031', padding: '6px 10px' }}>
                {error}
              </div>
            )}

          </div>

          {/* 右カラム: SQL + コメント */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* SQL エリア（独立スクロール） */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: 'var(--theme-font-display)',
                  fontSize: 9,
                  color: '#f9ca24',
                  background: '#1a1a1a',
                  padding: '6px 12px',
                  letterSpacing: 1,
                  flexShrink: 0,
                }}
              >
                SQL *
              </div>
              <textarea
                style={{
                  flex: 1,
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'monospace',
                  fontSize: 15,
                  padding: 14,
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.7,
                  textAlign: 'left',
                  overflowY: 'auto',
                }}
                value={sqlText}
                onChange={(e) => setSqlText(e.target.value)}
                spellCheck={false}
              />
            </div>
            {/* コメント（レシピ編集時のみ・独立スクロール） */}
            {recipe && <CommentThread recipeId={recipe.id} />}
          </div>
        </div>
      </div>

      {/* ER図モーダル */}
      {showErModal && (
        <ErDiagramModal sqlText={sqlText} onClose={() => setShowErModal(false)} />
      )}
    </>
  )
}
```

- [ ] **Step 2: コミット**

```bash
cd /workspace && git add frontend/src/components/modals/RecipeModal.tsx
git commit -m "feat: レシピモーダルをCSS変数化"
```

---

## Task 11: AdminModal.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/modals/AdminModal.tsx`

- [ ] **Step 1: AdminModal.tsx のスタイル定数部分を書き換える（ファイル先頭〜`export default` 直前）**

```tsx
import { useState } from 'react'
import { useDomains, useDomainMutations } from '../../hooks/useDomains'
import { useTags, useTagMutations } from '../../hooks/useTags'
import { useUsers, useUserMutations } from '../../hooks/useUsers'

interface Props {
  onClose: () => void
}

type Tab = 'domains' | 'tags' | 'users'

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: 'var(--theme-font-display)',
  fontSize: 15,
  padding: '10px 18px',
  border: '2px solid var(--theme-border)',
  background: active ? 'var(--theme-header-bg)' : 'var(--theme-bg-sunken)',
  color: active ? 'var(--theme-header-text)' : 'var(--theme-text)',
  cursor: 'pointer',
  letterSpacing: 1,
})

const inputStyle: React.CSSProperties = {
  background: '#fff',
  border: '2px solid var(--theme-border)',
  padding: '7px 10px',
  fontFamily: 'var(--theme-font)',
  fontSize: 15,
  outline: 'none',
}

const rowBtnStyle = (color: string, shadow: string): React.CSSProperties => ({
  background: color,
  color: '#fff',
  border: '2px solid var(--theme-border)',
  boxShadow: `2px 2px 0 ${shadow}`,
  fontFamily: 'var(--theme-font-display)',
  fontSize: 12,
  padding: '7px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})
```

- [ ] **Step 2: AdminModal.tsx のモーダル本体 JSX のスタイルを書き換える**

`return (` 以降の JSX 内で以下の箇所を書き換える：

```tsx
// モーダル本体 div
style={{
  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  zIndex: 101, width: '90vw', maxWidth: 1100, height: '90vh',
  background: 'var(--theme-bg-surface)',
  border: '3px solid var(--theme-border)',
  boxShadow: '6px 6px 0 var(--theme-shadow)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
}}

// ヘッダー div
style={{
  background: 'var(--theme-header-bg)',
  color: 'var(--theme-header-text)',
  fontFamily: 'var(--theme-font-display)',
  fontSize: 14,
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
}}

// タブコンテナ div
style={{ display: 'flex', gap: 0, borderBottom: '3px solid var(--theme-border)', background: 'var(--theme-bg-sunken)' }}

// ドメイン・タグ・ユーザー入力行 div
style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'var(--theme-bg-base)', border: '2px solid var(--theme-border-soft)' }}

// 一覧行 div (background: '#fff' → 'var(--theme-bg-surface)', border の #C0C0C0 → 'var(--theme-border-soft)')
style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--theme-bg-surface)', border: '2px solid var(--theme-border-soft)' }}

// admın バッジ span
style={{ fontFamily: 'var(--theme-font-display)', fontSize: 10, color: 'var(--theme-header-text)', background: 'var(--theme-header-bg)', padding: '3px 7px' }}

// monospace テキスト（ドメイン名・タグ名・ユーザー名）
style={{ fontFamily: 'var(--theme-font)', fontSize: 16, flex: 1 }}

// 説明テキスト
style={{ fontFamily: 'var(--theme-font)', fontSize: 15, flex: 2, color: 'var(--theme-text-muted)' }}
```

AdminModal.tsx の完全な書き換え後のファイル：

```tsx
import { useState } from 'react'
import { useDomains, useDomainMutations } from '../../hooks/useDomains'
import { useTags, useTagMutations } from '../../hooks/useTags'
import { useUsers, useUserMutations } from '../../hooks/useUsers'

interface Props {
  onClose: () => void
}

type Tab = 'domains' | 'tags' | 'users'

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: 'var(--theme-font-display)',
  fontSize: 15,
  padding: '10px 18px',
  border: '2px solid var(--theme-border)',
  background: active ? 'var(--theme-header-bg)' : 'var(--theme-bg-sunken)',
  color: active ? 'var(--theme-header-text)' : 'var(--theme-text)',
  cursor: 'pointer',
  letterSpacing: 1,
})

const inputStyle: React.CSSProperties = {
  background: '#fff',
  border: '2px solid var(--theme-border)',
  padding: '7px 10px',
  fontFamily: 'var(--theme-font)',
  fontSize: 15,
  outline: 'none',
}

const rowBtnStyle = (color: string, shadow: string): React.CSSProperties => ({
  background: color,
  color: '#fff',
  border: '2px solid var(--theme-border)',
  boxShadow: `2px 2px 0 ${shadow}`,
  fontFamily: 'var(--theme-font-display)',
  fontSize: 12,
  padding: '7px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

export default function AdminModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('domains')
  const [error, setError] = useState('')

  const { data: domains = [] } = useDomains()
  const domainMutations = useDomainMutations()
  const [newDomainName, setNewDomainName] = useState('')
  const [newDomainDesc, setNewDomainDesc] = useState('')

  const { data: tags = [] } = useTags()
  const tagMutations = useTagMutations()
  const [newTagName, setNewTagName] = useState('')

  const { data: users = [] } = useUsers()
  const userMutations = useUserMutations()
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null)
  const [resetPasswordValue, setResetPasswordValue] = useState('')

  const wrap = async (fn: () => Promise<unknown>) => {
    setError('')
    try { await fn() } catch (e) { setError(e instanceof Error ? e.message : 'エラーが発生しました') }
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }} onClick={onClose} />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 101, width: '90vw', maxWidth: 1100, height: '90vh',
          background: 'var(--theme-bg-surface)',
          border: '3px solid var(--theme-border)',
          boxShadow: '6px 6px 0 var(--theme-shadow)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          background: 'var(--theme-header-bg)',
          color: 'var(--theme-header-text)',
          fontFamily: 'var(--theme-font-display)',
          fontSize: 14,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>ADMIN PANEL</span>
          <span style={{ cursor: 'pointer', color: '#d63031' }} onClick={onClose}>[ X ]</span>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '3px solid var(--theme-border)', background: 'var(--theme-bg-sunken)' }}>
          {(['domains', 'tags', 'users'] as Tab[]).map((t) => (
            <button key={t} style={tabBtnStyle(tab === t)} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ fontFamily: 'var(--theme-font)', fontSize: 14, color: '#d63031', background: '#ffe0e0', border: '1px solid #d63031', padding: '6px 10px', margin: '6px 10px 0' }}>
            {error}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

          {tab === 'domains' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'var(--theme-bg-base)', border: '2px solid var(--theme-border-soft)' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="ドメイン名" value={newDomainName} onChange={(e) => setNewDomainName(e.target.value)} />
                <input style={{ ...inputStyle, flex: 2 }} placeholder="説明（任意）" value={newDomainDesc} onChange={(e) => setNewDomainDesc(e.target.value)} />
                <button
                  style={rowBtnStyle('#2ecc71', '#1a8a4a')}
                  onClick={() => wrap(async () => {
                    await domainMutations.create.mutateAsync({ name: newDomainName, description: newDomainDesc || undefined })
                    setNewDomainName(''); setNewDomainDesc('')
                  })}
                >
                  + ADD
                </button>
              </div>
              {domains.map((d) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--theme-bg-surface)', border: '2px solid var(--theme-border-soft)' }}>
                  <span style={{ fontFamily: 'var(--theme-font)', fontSize: 16, flex: 1 }}>{d.name}</span>
                  <span style={{ fontFamily: 'var(--theme-font)', fontSize: 15, flex: 2, color: 'var(--theme-text-muted)' }}>{d.description}</span>
                  <button style={rowBtnStyle('#d63031', '#8a1010')} onClick={() => wrap(() => domainMutations.remove.mutateAsync(d.id))}>DEL</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'tags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'var(--theme-bg-base)', border: '2px solid var(--theme-border-soft)' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="タグ名" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                <button
                  style={rowBtnStyle('#2ecc71', '#1a8a4a')}
                  onClick={() => wrap(async () => {
                    await tagMutations.create.mutateAsync({ name: newTagName })
                    setNewTagName('')
                  })}
                >
                  + ADD
                </button>
              </div>
              {tags.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--theme-bg-surface)', border: '2px solid var(--theme-border-soft)' }}>
                  <span style={{ fontFamily: 'var(--theme-font)', fontSize: 16, flex: 1 }}>{t.name}</span>
                  <button style={rowBtnStyle('#d63031', '#8a1010')} onClick={() => wrap(() => tagMutations.remove.mutateAsync(t.id))}>DEL</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'var(--theme-bg-base)', border: '2px solid var(--theme-border-soft)', flexWrap: 'wrap' }}>
                <input style={{ ...inputStyle, width: 140 }} placeholder="ユーザー名" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                <input type="password" style={{ ...inputStyle, width: 140 }} placeholder="パスワード" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <label style={{ fontFamily: 'var(--theme-font)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} />
                  管理者
                </label>
                <button
                  style={rowBtnStyle('#2ecc71', '#1a8a4a')}
                  onClick={() => wrap(async () => {
                    await userMutations.create.mutateAsync({ username: newUsername, password: newPassword, is_admin: newIsAdmin })
                    setNewUsername(''); setNewPassword(''); setNewIsAdmin(false)
                  })}
                >
                  + ADD
                </button>
              </div>

              {users.map((u) => (
                <div key={u.id} style={{ padding: '6px 8px', background: 'var(--theme-bg-surface)', border: '2px solid var(--theme-border-soft)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--theme-font)', fontSize: 16, flex: 1 }}>{u.username}</span>
                    {u.is_admin && <span style={{ fontFamily: 'var(--theme-font-display)', fontSize: 10, color: 'var(--theme-header-text)', background: 'var(--theme-header-bg)', padding: '3px 7px' }}>ADMIN</span>}
                    {!u.is_active && <span style={{ fontFamily: 'var(--theme-font-display)', fontSize: 10, color: '#d63031' }}>INACTIVE</span>}
                    <button
                      style={rowBtnStyle(u.is_active ? '#d63031' : '#2ecc71', u.is_active ? '#8a1010' : '#1a8a4a')}
                      onClick={() => wrap(() => userMutations.update.mutateAsync({ id: u.id, data: { is_active: !u.is_active } }))}
                    >
                      {u.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>
                  </div>
                  {resetPasswordId === u.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        type="password"
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="新しいパスワード"
                        value={resetPasswordValue}
                        onChange={(e) => setResetPasswordValue(e.target.value)}
                      />
                      <button
                        style={rowBtnStyle('#525252', '#333')}
                        onClick={() => wrap(async () => {
                          await userMutations.resetPassword.mutateAsync({ id: u.id, password: resetPasswordValue })
                          setResetPasswordId(null); setResetPasswordValue('')
                        })}
                      >
                        SET
                      </button>
                      <button style={rowBtnStyle('#A0A0A0', '#666')} onClick={() => setResetPasswordId(null)}>X</button>
                    </div>
                  ) : (
                    <button
                      style={{ ...rowBtnStyle('#0984e3', '#055a9a'), alignSelf: 'flex-start' }}
                      onClick={() => setResetPasswordId(u.id)}
                    >
                      RESET PASSWORD
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: コミット**

```bash
cd /workspace && git add frontend/src/components/modals/AdminModal.tsx
git commit -m "feat: 管理者モーダルをCSS変数化"
```

---

## Task 12: CommentThread.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/modals/CommentThread.tsx`

- [ ] **Step 1: CommentThread.tsx を書き換える**

```tsx
import { useState } from 'react'
import { useComments } from '../../hooks/useComments'
import type { Comment } from '../../types'

interface Props {
  recipeId: number
}

export default function CommentThread({ recipeId }: Props) {
  const { comments, create, update, remove, currentUser } = useComments(recipeId)
  const [open, setOpen] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleCreate = async () => {
    if (!newContent.trim()) return
    await create.mutateAsync(newContent.trim())
    setNewContent('')
  }

  const handleUpdate = async (comment: Comment) => {
    if (!editContent.trim()) return
    await update.mutateAsync({ id: comment.id, content: editContent.trim() })
    setEditingId(null)
  }

  const handleDelete = async (comment: Comment) => {
    if (!confirm('このコメントを削除しますか？')) return
    await remove.mutateAsync(comment.id)
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const avatarInitials = (username: string) =>
    username.slice(0, 2).toUpperCase()

  return (
    <div style={{ borderTop: '2px solid var(--theme-border-soft)', marginTop: 4, paddingTop: 6 }}>
      {/* 折りたたみバー */}
      <div
        style={{
          background: 'var(--theme-bg-base)',
          border: '2px solid var(--theme-border-soft)',
          padding: '8px 12px',
          fontFamily: 'var(--theme-font-display)',
          fontSize: 11,
          color: 'var(--theme-text)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          letterSpacing: 1,
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <span>COMMENTS ({comments.length})</span>
        <span>{open ? '▼ CLOSE' : '▶ OPEN'}</span>
      </div>

      {/* スレッド展開 */}
      {open && (
        <div
          style={{
            background: 'var(--theme-bg-surface)',
            border: '2px solid var(--theme-border-soft)',
            borderTop: 'none',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 320,
          }}
        >
          {/* コメント一覧（スクロール） */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }}>
          {comments.map((comment) => {
            const isOwn = currentUser?.id === comment.user_id
            const isAdmin = currentUser?.is_admin
            return (
              <div
                key={comment.id}
                style={{
                  display: 'flex',
                  gap: 6,
                  paddingBottom: 8,
                  marginBottom: 8,
                  borderBottom: '1px solid var(--theme-bg-sunken)',
                }}
              >
                {/* アバター */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: 'var(--theme-shadow)',
                    border: '2px solid var(--theme-border)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: 'var(--theme-font-display)',
                    fontSize: 10,
                  }}
                >
                  {avatarInitials(comment.user?.username ?? '?')}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* メタ情報 */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--theme-font-display)',
                      fontSize: 10,
                      color: 'var(--theme-text-muted)',
                      marginBottom: 6,
                    }}
                  >
                    <span>{comment.user?.username ?? '?'} &nbsp; {comment.created_at.slice(0, 10)}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isOwn && (
                        <span
                          style={{ color: '#0984e3', cursor: 'pointer' }}
                          onClick={() => startEdit(comment)}
                        >
                          EDIT
                        </span>
                      )}
                      {(isOwn || isAdmin) && (
                        <span
                          style={{ color: '#d63031', cursor: 'pointer' }}
                          onClick={() => handleDelete(comment)}
                        >
                          DEL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 本文 or 編集フォーム */}
                  {editingId === comment.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        style={{
                          flex: 1,
                          background: '#fff',
                          border: '2px solid var(--theme-border)',
                          padding: '3px 5px',
                          fontFamily: 'var(--theme-font)',
                          fontSize: 14,
                          outline: 'none',
                        }}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(comment)}
                        autoFocus
                      />
                      <button
                        style={{
                          background: 'var(--theme-shadow)',
                          color: '#fff',
                          border: '2px solid var(--theme-border)',
                          fontFamily: 'var(--theme-font-display)',
                          fontSize: 10,
                          padding: '4px 8px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleUpdate(comment)}
                      >
                        OK
                      </button>
                      <button
                        style={{
                          background: 'var(--theme-border-soft)',
                          color: 'var(--theme-text)',
                          border: '2px solid var(--theme-border)',
                          fontFamily: 'var(--theme-font-display)',
                          fontSize: 10,
                          padding: '4px 8px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setEditingId(null)}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontFamily: 'var(--theme-font)', fontSize: 14, color: 'var(--theme-text)', lineHeight: 1.5 }}>
                      {comment.content}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          </div>

          {/* 新規コメント入力（固定） */}
          <div style={{ display: 'flex', gap: 6, padding: '6px 8px', borderTop: '1px solid var(--theme-bg-sunken)', background: 'var(--theme-bg-surface)', flexShrink: 0 }}>
            <input
              style={{
                flex: 1,
                background: '#fff',
                border: '2px solid var(--theme-border)',
                boxShadow: 'inset 1px 1px 0 var(--theme-border-soft)',
                padding: '4px 6px',
                fontFamily: 'var(--theme-font)',
                fontSize: 14,
                outline: 'none',
              }}
              placeholder="コメントを追加..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              style={{
                background: 'var(--theme-shadow)',
                color: '#fff',
                border: '2px solid var(--theme-border)',
                boxShadow: '2px 2px 0 var(--theme-border)',
                fontFamily: 'var(--theme-font-display)',
                fontSize: 10,
                padding: '6px 10px',
                cursor: 'pointer',
                letterSpacing: 1,
              }}
              onClick={handleCreate}
              disabled={create.isPending}
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Task 13: ErDiagramModal.tsx をCSS変数化

**Files:**
- Modify: `frontend/src/components/modals/ErDiagramModal.tsx`

- [ ] **Step 1: ErDiagramModal.tsx のノードスタイルとモーダルスタイルを書き換える**

ノードの `style` オブジェクト（`nodes` useMemo 内）：

```tsx
style: {
  background: 'var(--theme-bg-surface)',
  border: '3px solid var(--theme-border)',
  boxShadow: '3px 3px 0 var(--theme-shadow)',
  fontFamily: 'var(--theme-font-display)',
  fontSize: 14,
  color: 'var(--theme-text)',
  padding: '14px 20px',
  borderRadius: 0,
},
```

モーダル本体 div：

```tsx
style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 201,
  width: '95vw',
  height: '90vh',
  background: 'var(--theme-bg-surface)',
  border: '3px solid var(--theme-border)',
  boxShadow: '6px 6px 0 var(--theme-shadow)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}}
```

ヘッダー div（モーダル内部）はファイルの残りを読んで同様に書き換える。完全なファイルは ErDiagramModal.tsx の既存内容に対して以下の置換を適用：

- `background: '#ECECEC'` → `background: 'var(--theme-bg-surface)'`
- `border: '3px solid #333'` → `border: '3px solid var(--theme-border)'`
- `boxShadow: '3px 3px 0 #525252'` → `boxShadow: '3px 3px 0 var(--theme-shadow)'`  
- `boxShadow: '6px 6px 0 #525252'` → `boxShadow: '6px 6px 0 var(--theme-shadow)'`
- `background: '#333'` (ヘッダー) → `background: 'var(--theme-header-bg)'`
- `color: '#f9ca24'` (ヘッダーテキスト) → `color: 'var(--theme-header-text)'`
- `fontFamily: "'Press Start 2P', monospace"` → `fontFamily: 'var(--theme-font-display)'`
- `color: '#333'` (ノードテキスト) → `color: 'var(--theme-text)'`

- [ ] **Step 2: コミット**

```bash
cd /workspace && git add frontend/src/components/modals/
git commit -m "feat: モーダル群をCSS変数化"
```

---

## Task 14: 動作確認・TypeScript チェック・最終コミット

- [ ] **Step 1: TypeScript エラーがないことを確認**

```bash
cd /workspace/frontend && npx tsc --noEmit 2>&1
```

期待結果：エラーなし（0 errors）

- [ ] **Step 2: dev server で3テーマの動作確認**

サイドバー最下部の RPG / MOD / ITA ボタンをそれぞれクリックして：
1. 色とフォントが切り替わること
2. リロード後も選択したテーマが維持されること（localStorage 確認）
3. 全モーダルでテーマが反映されていること

- [ ] **Step 3: 最終コミット**

```bash
cd /workspace && git add -A
git commit -m "feat: テーマ切り替え機能（Retro/Modern/Italian）実装完了"
```
