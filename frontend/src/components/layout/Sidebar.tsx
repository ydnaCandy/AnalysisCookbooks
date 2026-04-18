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
