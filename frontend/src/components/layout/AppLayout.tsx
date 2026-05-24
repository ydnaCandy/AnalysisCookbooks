import type { ReactNode } from 'react'

interface AppLayoutProps {
  sidebar: ReactNode
  toolbar: ReactNode
  children: ReactNode
  statusBar: ReactNode
}

export default function AppLayout({ sidebar, toolbar, children, statusBar }: AppLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'auto' }}>
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
