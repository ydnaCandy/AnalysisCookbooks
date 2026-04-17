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
    <div style={{ borderTop: '2px solid #A0A0A0', marginTop: 4, paddingTop: 6 }}>
      {/* 折りたたみバー */}
      <div
        style={{
          background: '#D8D8D8',
          border: '2px solid #A0A0A0',
          padding: '8px 12px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 11,
          color: '#333',
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
            background: '#fff',
            border: '2px solid #C0C0C0',
            borderTop: 'none',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 320,
          }}
        >
          {/* コメント一覧（スクロール） */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }}>
          {/* コメント一覧 */}
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
                  borderBottom: '1px solid #ECECEC',
                }}
              >
                {/* アバター */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: '#525252',
                    border: '2px solid #333',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: "'Press Start 2P', monospace",
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
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 10,
                      color: '#666',
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
                          border: '2px solid #333',
                          padding: '3px 5px',
                          fontFamily: 'monospace',
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
                          background: '#525252',
                          color: '#fff',
                          border: '2px solid #333',
                          fontFamily: "'Press Start 2P', monospace",
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
                          background: '#A0A0A0',
                          color: '#333',
                          border: '2px solid #333',
                          fontFamily: "'Press Start 2P', monospace",
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
                    <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#333', lineHeight: 1.5 }}>
                      {comment.content}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          </div>

          {/* 新規コメント入力（固定） */}
          <div style={{ display: 'flex', gap: 6, padding: '6px 8px', borderTop: '1px solid #ECECEC', background: '#fff', flexShrink: 0 }}>
            <input
              style={{
                flex: 1,
                background: '#fff',
                border: '2px solid #333',
                boxShadow: 'inset 1px 1px 0 #A0A0A0',
                padding: '4px 6px',
                fontFamily: 'monospace',
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
                background: '#525252',
                color: '#fff',
                border: '2px solid #333',
                boxShadow: '2px 2px 0 #333',
                fontFamily: "'Press Start 2P', monospace",
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
