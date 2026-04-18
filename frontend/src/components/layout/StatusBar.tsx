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
