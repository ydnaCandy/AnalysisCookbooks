import { useState, useEffect, lazy, Suspense } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import type { Domain, Tag, Recipe } from '../../types'
import { useRecipeMutations } from '../../hooks/useRecipes'
import { useComments } from '../../hooks/useComments'
import CommentThread from './CommentThread'
import { exportRecipeAsMarkdown } from '../../utils/exportMarkdown'

const ErDiagramModal = lazy(() => import('./ErDiagramModal'))

interface Props {
  recipe: Recipe | null
  domains: Domain[]
  tags: Tag[]
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  background: '#fff',
  border: '2px solid var(--theme-border)',
  boxShadow: 'inset 2px 2px 0 var(--theme-border-soft)',
  padding: '8px 10px',
  fontFamily: 'var(--theme-font)',
  fontSize: 16,
  outline: 'none',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--theme-font-display)',
  fontSize: 12,
  color: 'var(--theme-text-muted)',
  marginBottom: 4,
  display: 'block',
}

const btnBase: React.CSSProperties = {
  border: '2px solid var(--theme-border)',
  padding: '8px 16px',
  fontFamily: 'var(--theme-font-display)',
  fontSize: 11,
  cursor: 'pointer',
  letterSpacing: 1,
}

export default function RecipeModal({ recipe, domains, tags, onClose }: Props) {
  const { create, update, remove } = useRecipeMutations()
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [sqlText, setSqlText] = useState(recipe?.sql_text ?? '')
  const [domainId, setDomainId] = useState<number>(recipe?.domain_id ?? (domains[0]?.id ?? 0))
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    recipe?.tags.map((t) => t.id) ?? []
  )
  const [showErModal, setShowErModal] = useState(false)
  const [showMdModal, setShowMdModal] = useState(false)
  const [includeComments, setIncludeComments] = useState(true)
  const [error, setError] = useState('')

  const { comments } = useComments(recipe?.id ?? 0)

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title)
      setDescription(recipe.description ?? '')
      setSqlText(recipe.sql_text)
      setDomainId(recipe.domain_id)
      setSelectedTagIds(recipe.tags.map((t) => t.id))
    }
  }, [recipe])

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim() || !sqlText.trim() || !domainId) {
      setError('タイトル・SQL・ドメインは必須です')
      return
    }
    try {
      if (recipe) {
        await update.mutateAsync({ id: recipe.id, data: { title, description, sql_text: sqlText, domain_id: domainId, tag_ids: selectedTagIds } })
      } else {
        await create.mutateAsync({ title, description, sql_text: sqlText, domain_id: domainId, tag_ids: selectedTagIds })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!recipe) return
    if (!confirm(`「${recipe.title}」を削除しますか？`)) return
    try {
      await remove.mutateAsync(recipe.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }}
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          width: '98vw',
          height: '97vh',
          maxWidth: '98vw',
          maxHeight: '97vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--theme-bg-surface)',
          border: '3px solid var(--theme-border)',
          boxShadow: '6px 6px 0 var(--theme-shadow)',
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
          <span>{recipe ? `EDIT: ${recipe.title}` : 'NEW RECIPE'}</span>
          <span style={{ cursor: 'pointer', color: '#d63031' }} onClick={onClose}>[ X ]</span>
        </div>

        {/* ボディ */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* 左カラム */}
          <div
            style={{
              flex: 1,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              overflowY: 'auto',
              borderRight: '2px solid var(--theme-border-soft)',
            }}
          >
            <div>
              <label style={labelStyle}>TITLE *</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>DOMAIN *</label>
              <select
                style={{ ...inputStyle }}
                value={domainId}
                onChange={(e) => setDomainId(Number(e.target.value))}
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>TAGS</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id)
                  return (
                    <span
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        fontFamily: 'var(--theme-font-display)',
                        fontSize: 9,
                        padding: '4px 8px',
                        border: '2px solid var(--theme-border)',
                        background: selected ? '#0984e3' : 'var(--theme-bg-sunken)',
                        color: selected ? '#fff' : 'var(--theme-text)',
                        cursor: 'pointer',
                      }}
                    >
                      {tag.name}
                    </span>
                  )
                })}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>DESCRIPTION / NOTES</label>
              <textarea
                style={{ ...inputStyle, flex: 1, resize: 'none', minHeight: 80 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* ボタン */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                style={{ ...btnBase, background: 'var(--theme-accent)', color: 'var(--theme-accent-text)', boxShadow: '3px 3px 0 var(--theme-accent-dark)' }}
                onClick={handleSave}
                disabled={create.isPending || update.isPending}
              >
                [ SAVE ]
              </button>
              {recipe && (
                <button
                  style={{ ...btnBase, background: '#d63031', color: '#fff', boxShadow: '3px 3px 0 #8a1010' }}
                  onClick={handleDelete}
                >
                  [ DELETE ]
                </button>
              )}
              <button
                style={{ ...btnBase, background: '#0984e3', color: '#fff', boxShadow: '3px 3px 0 #055a9a' }}
                onClick={() => setShowErModal(true)}
                disabled={!sqlText.trim()}
              >
                [ ER ]
              </button>
              {recipe && (
                <button
                  style={{ ...btnBase, background: '#2ecc71', color: '#fff', boxShadow: '3px 3px 0 #1a8a4a' }}
                  onClick={() => setShowMdModal(true)}
                >
                  [ MD ]
                </button>
              )}
            </div>

            {error && (
              <div style={{ fontFamily: 'var(--theme-font)', fontSize: 14, color: '#d63031', background: '#ffe0e0', border: '1px solid #d63031', padding: '6px 10px' }}>
                {error}
              </div>
            )}

          </div>

          {/* 右カラム: SQL + コメント */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* SQL エリア（独立スクロール） */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: 'var(--theme-font-display)',
                  fontSize: 9,
                  color: '#f9ca24',
                  background: '#1a1a1a',
                  padding: '6px 12px',
                  letterSpacing: 1,
                  flexShrink: 0,
                }}
              >
                SQL *
              </div>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <CodeMirror
                  value={sqlText}
                  onChange={setSqlText}
                  extensions={[sql()]}
                  theme="dark"
                  height="100%"
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    autocompletion: false,
                  }}
                  style={{ position: 'absolute', inset: 0, fontSize: 15 }}
                />
              </div>
            </div>
            {/* コメント（レシピ編集時のみ・独立スクロール） */}
            {recipe && <CommentThread recipeId={recipe.id} />}
          </div>
        </div>
      </div>

      {/* MD出力確認モーダル */}
      {showMdModal && recipe && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
            onClick={() => setShowMdModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 201,
              background: 'var(--theme-bg-surface)',
              border: '3px solid var(--theme-border)',
              boxShadow: '6px 6px 0 var(--theme-shadow)',
              padding: 24,
              minWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'var(--theme-font-display)', fontSize: 14, color: 'var(--theme-header-text)', background: 'var(--theme-header-bg)', padding: '8px 12px', margin: '-24px -24px 0' }}>
              MD EXPORT OPTIONS
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--theme-font)', fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              コメントを含める
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                style={{ ...btnBase, background: 'var(--theme-bg-sunken)' }}
                onClick={() => setShowMdModal(false)}
              >
                [ CANCEL ]
              </button>
              <button
                style={{ ...btnBase, background: '#2ecc71', color: '#fff', boxShadow: '3px 3px 0 #1a8a4a' }}
                onClick={() => {
                  exportRecipeAsMarkdown(recipe, includeComments ? comments : undefined)
                  setShowMdModal(false)
                }}
              >
                [ EXPORT ]
              </button>
            </div>
          </div>
        </>
      )}

      {/* ER図モーダル */}
      {showErModal && (
        <Suspense fallback={null}>
          <ErDiagramModal sqlText={sqlText} onClose={() => setShowErModal(false)} />
        </Suspense>
      )}
    </>
  )
}
