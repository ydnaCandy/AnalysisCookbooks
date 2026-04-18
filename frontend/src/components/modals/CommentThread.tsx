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
