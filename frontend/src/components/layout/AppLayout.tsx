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
          background: '#333',
          color: '#f9ca24',
          padding: '8px 16px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 11,
          letterSpacing: 3,
          borderBottom: '3px solid #525252',
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
            background: '#D8D8D8',
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
