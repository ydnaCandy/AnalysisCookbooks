interface StatusBarProps {
  count: number
  filterLabel: string
}

export default function StatusBar({ count, filterLabel }: StatusBarProps) {
  return (
    <div
      style={{
        background: '#333',
        padding: '4px 12px',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7,
        color: '#f9ca24',
        display: 'flex',
        gap: 16,
        letterSpacing: 1,
        borderTop: '3px solid #525252',
        flexShrink: 0,
      }}
    >
      <span>{count} RECIPES FOUND</span>
      <span style={{ color: '#525252' }}>|</span>
      <span>FILTER: {filterLabel}</span>
      <span style={{ color: '#525252' }}>|</span>
      <span>VER 1.0.0</span>
    </div>
  )
}
