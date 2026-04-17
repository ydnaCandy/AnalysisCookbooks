import { useMemo } from 'react'
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { parseSqlForEr } from '../../utils/sqlParser'

interface Props {
  sqlText: string
  onClose: () => void
}

export default function ErDiagramModal({ sqlText, onClose }: Props) {
  const erData = useMemo(() => parseSqlForEr(sqlText), [sqlText])

  const nodes: Node[] = useMemo(() => {
    if (!erData) return []
    return erData.tables.map((table, i) => ({
      id: table,
      position: { x: (i % 3) * 220 + 40, y: Math.floor(i / 3) * 160 + 40 },
      data: { label: table },
      style: {
        background: '#ECECEC',
        border: '3px solid #333',
        boxShadow: '3px 3px 0 #525252',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 14,
        color: '#333',
        padding: '14px 20px',
        borderRadius: 0,
      },
    }))
  }, [erData])

  const edges: Edge[] = useMemo(() => {
    if (!erData) return []
    return erData.joins.map((join, i) => ({
      id: `edge-${i}`,
      source: join.from,
      target: join.to,
      label: join.on,
      labelStyle: {
        fontFamily: 'monospace',
        fontSize: 10,
        fill: '#333',
      },
      labelBgStyle: {
        fill: '#f9ca24',
        fillOpacity: 0.9,
      },
      style: { stroke: '#0984e3', strokeWidth: 2 },
      type: 'default',
    }))
  }, [erData])

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
          background: '#ECECEC',
          border: '3px solid #333',
          boxShadow: '6px 6px 0 #525252',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: '#333',
            color: '#f9ca24',
            fontFamily: "'Press Start 2P', monospace",
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

        {/* フロー */}
        <div style={{ flex: 1 }}>
          {!erData ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 14,
                color: '#d63031',
              }}
            >
              SQLのパースに失敗しました
            </div>
          ) : erData.tables.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 14,
                color: '#A0A0A0',
              }}
            >
              テーブルが検出されませんでした
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background color="#A0A0A0" gap={8} />
              <Controls />
            </ReactFlow>
          )}
        </div>
      </div>
    </>
  )
}
