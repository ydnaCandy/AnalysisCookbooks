import { useMemo, useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { parseSqlForEr, erDataToMermaid } from '../../utils/sqlParser'

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  flowchart: { curve: 'basis' },
})

interface Props {
  sqlText: string
  onClose: () => void
}

export default function ErDiagramModal({ sqlText, onClose }: Props) {
  const erData = useMemo(() => parseSqlForEr(sqlText), [sqlText])
  const diagramText = useMemo(
    () => (erData && erData.tables.length > 0 ? erDataToMermaid(erData) : null),
    [erData]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = useState(false)

  useEffect(() => {
    if (!diagramText || !containerRef.current) return
    setRenderError(false)
    const id = `er-${Date.now()}`
    mermaid
      .render(id, diagramText)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      })
      .catch(() => setRenderError(true))
  }, [diagramText])

  const errorMsg =
    !erData ? 'SQLのパースに失敗しました' :
    erData.tables.length === 0 ? 'テーブルが検出されませんでした' :
    renderError ? '図の生成に失敗しました' :
    null

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200 }}
        onClick={onClose}
      />
      <div
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
          <span>ER DIAGRAM</span>
          <span style={{ cursor: 'pointer', color: '#d63031' }} onClick={onClose}>[ X ]</span>
        </div>

        {/* コンテンツ */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#fff',
          }}
        >
          {errorMsg ? (
            <div
              style={{
                fontFamily: 'var(--theme-font-display)',
                fontSize: 14,
                color: errorMsg === 'テーブルが検出されませんでした'
                  ? 'var(--theme-border-soft)'
                  : '#d63031',
              }}
            >
              {errorMsg}
            </div>
          ) : (
            <div ref={containerRef} style={{ maxWidth: '100%' }} />
          )}
        </div>
      </div>
    </>
  )
}
