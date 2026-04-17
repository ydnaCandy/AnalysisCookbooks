import { useAuth } from '../../hooks/useAuth'
import type { Domain } from '../../types'

interface SidebarProps {
  domains: Domain[]
  selectedDomainId: number | null
  onSelectDomain: (id: number | null) => void
  onOpenAdmin: () => void
}

export default function Sidebar({ domains, selectedDomainId, onSelectDomain, onOpenAdmin }: SidebarProps) {
  const { user, logout } = useAuth()

  const itemStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 10px',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 8,
    color: active ? '#f9ca24' : '#ccc',
    background: active ? '#000' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    letterSpacing: 1,
    borderBottom: '1px solid #444',
  })

  const DOMAIN_COLORS: Record<string, string> = {
    製造: '#2ecc71',
    営業: '#f9ca24',
    経営: '#0984e3',
  }

  return (
    <div
      style={{
        width: 170,
        background: '#1a1a1a',
        borderRight: '3px solid #333',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* メニュー */}
      <div style={{ padding: '8px 0', borderBottom: '2px solid #444' }}>
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            color: '#525252',
            padding: '4px 10px 6px',
            letterSpacing: 2,
          }}
        >
          - MENU -
        </div>
        <div style={itemStyle(true)}>
          <span style={{ color: '#f9ca24' }}>&#9658;</span> レシピ一覧
        </div>
        {user?.is_admin && (
          <div style={itemStyle(false)} onClick={onOpenAdmin}>
            <span style={{ color: '#A0A0A0' }}>&nbsp;</span> 管理者メニュー
          </div>
        )}
      </div>

      {/* ドメインフィルタ */}
      <div style={{ padding: '8px 0', flex: 1 }}>
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            color: '#525252',
            padding: '4px 10px 6px',
            letterSpacing: 2,
          }}
        >
          - DOMAIN -
        </div>
        <div
          style={itemStyle(selectedDomainId === null)}
          onClick={() => onSelectDomain(null)}
        >
          <span style={{ color: selectedDomainId === null ? '#f9ca24' : '#A0A0A0' }}>
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
            <span style={{ color: DOMAIN_COLORS[d.name] ?? '#A0A0A0', fontSize: 10 }}>&#9632;</span>
            {d.name}
          </div>
        ))}
      </div>

      {/* ユーザー情報 */}
      <div
        style={{
          background: '#111',
          padding: '8px 10px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 7,
          color: '#aaa',
          lineHeight: 2,
          borderTop: '2px solid #444',
        }}
      >
        <div>PLAYER:</div>
        <div style={{ color: '#fff' }}>{user?.username}</div>
        {user?.is_admin && <div style={{ color: '#f9ca24' }}>★ ADMIN</div>}
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
