import { useState } from 'react'
import { useDomains, useDomainMutations } from '../../hooks/useDomains'
import { useTags, useTagMutations } from '../../hooks/useTags'
import { useUsers, useUserMutations } from '../../hooks/useUsers'

interface Props {
  onClose: () => void
}

type Tab = 'domains' | 'tags' | 'users'

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: 'var(--theme-font-display)',
  fontSize: 15,
  padding: '10px 18px',
  border: '2px solid var(--theme-border)',
  background: active ? 'var(--theme-header-bg)' : 'var(--theme-bg-sunken)',
  color: active ? 'var(--theme-header-text)' : 'var(--theme-text)',
  cursor: 'pointer',
  letterSpacing: 1,
})

const inputStyle: React.CSSProperties = {
  background: '#fff',
  border: '2px solid var(--theme-border)',
  padding: '7px 10px',
  fontFamily: 'var(--theme-font)',
  fontSize: 15,
  outline: 'none',
}

const rowBtnStyle = (color: string, shadow: string): React.CSSProperties => ({
  background: color,
  color: '#fff',
  border: '2px solid var(--theme-border)',
  boxShadow: `2px 2px 0 ${shadow}`,
  fontFamily: 'var(--theme-font-display)',
  fontSize: 12,
  padding: '7px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

export default function AdminModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('domains')
  const [error, setError] = useState('')

  const { data: domains = [] } = useDomains()
  const domainMutations = useDomainMutations()
  const [newDomainName, setNewDomainName] = useState('')
  const [newDomainDesc, setNewDomainDesc] = useState('')

  const { data: tags = [] } = useTags()
  const tagMutations = useTagMutations()
  const [newTagName, setNewTagName] = useState('')

  const { data: users = [] } = useUsers()
  const userMutations = useUserMutations()
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null)
  const [resetPasswordValue, setResetPasswordValue] = useState('')

  const wrap = async (fn: () => Promise<unknown>) => {
    setError('')
    try { await fn() } catch (e) { setError(e instanceof Error ? e.message : 'エラーが発生しました') }
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }} onClick={onClose} />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 101, width: '90vw', maxWidth: 1100, height: '90vh',
          background: 'var(--theme-bg-surface)',
          border: '3px solid var(--theme-border)',
          boxShadow: '6px 6px 0 var(--theme-shadow)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          background: 'var(--theme-header-bg)',
          color: 'var(--theme-header-text)',
          fontFamily: 'var(--theme-font-display)',
          fontSize: 14,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>ADMIN PANEL</span>
          <span style={{ cursor: 'pointer', color: '#d63031' }} onClick={onClose}>[ X ]</span>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '3px solid var(--theme-border)', background: 'var(--theme-bg-sunken)' }}>
          {(['domains', 'tags', 'users'] as Tab[]).map((t) => (
            <button key={t} style={tabBtnStyle(tab === t)} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ fontFamily: 'var(--theme-font)', fontSize: 14, color: '#d63031', background: '#ffe0e0', border: '1px solid #d63031', padding: '6px 10px', margin: '6px 10px 0' }}>
            {error}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

          {tab === 'domains' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'var(--theme-bg-base)', border: '2px solid var(--theme-border-soft)' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="ドメイン名" value={newDomainName} onChange={(e) => setNewDomainName(e.target.value)} />
                <input style={{ ...inputStyle, flex: 2 }} placeholder="説明（任意）" value={newDomainDesc} onChange={(e) => setNewDomainDesc(e.target.value)} />
                <button
                  style={rowBtnStyle('#2ecc71', '#1a8a4a')}
                  onClick={() => wrap(async () => {
                    await domainMutations.create.mutateAsync({ name: newDomainName, description: newDomainDesc || undefined })
                    setNewDomainName(''); setNewDomainDesc('')
                  })}
                >
                  + ADD
                </button>
              </div>
              {domains.map((d) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--theme-bg-surface)', border: '2px solid var(--theme-border-soft)' }}>
                  <span style={{ fontFamily: 'var(--theme-font)', fontSize: 16, flex: 1 }}>{d.name}</span>
                  <span style={{ fontFamily: 'var(--theme-font)', fontSize: 15, flex: 2, color: 'var(--theme-text-muted)' }}>{d.description}</span>
                  <button style={rowBtnStyle('#d63031', '#8a1010')} onClick={() => wrap(() => domainMutations.remove.mutateAsync(d.id))}>DEL</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'tags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'var(--theme-bg-base)', border: '2px solid var(--theme-border-soft)' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="タグ名" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                <button
                  style={rowBtnStyle('#2ecc71', '#1a8a4a')}
                  onClick={() => wrap(async () => {
                    await tagMutations.create.mutateAsync({ name: newTagName })
                    setNewTagName('')
                  })}
                >
                  + ADD
                </button>
              </div>
              {tags.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--theme-bg-surface)', border: '2px solid var(--theme-border-soft)' }}>
                  <span style={{ fontFamily: 'var(--theme-font)', fontSize: 16, flex: 1 }}>{t.name}</span>
                  <button style={rowBtnStyle('#d63031', '#8a1010')} onClick={() => wrap(() => tagMutations.remove.mutateAsync(t.id))}>DEL</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'var(--theme-bg-base)', border: '2px solid var(--theme-border-soft)', flexWrap: 'wrap' }}>
                <input style={{ ...inputStyle, width: 140 }} placeholder="ユーザー名" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                <input type="password" style={{ ...inputStyle, width: 140 }} placeholder="パスワード" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <label style={{ fontFamily: 'var(--theme-font)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} />
                  管理者
                </label>
                <button
                  style={rowBtnStyle('#2ecc71', '#1a8a4a')}
                  onClick={() => wrap(async () => {
                    await userMutations.create.mutateAsync({ username: newUsername, password: newPassword, is_admin: newIsAdmin })
                    setNewUsername(''); setNewPassword(''); setNewIsAdmin(false)
                  })}
                >
                  + ADD
                </button>
              </div>

              {users.map((u) => (
                <div key={u.id} style={{ padding: '6px 8px', background: 'var(--theme-bg-surface)', border: '2px solid var(--theme-border-soft)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--theme-font)', fontSize: 16, flex: 1 }}>{u.username}</span>
                    {u.is_admin && <span style={{ fontFamily: 'var(--theme-font-display)', fontSize: 10, color: 'var(--theme-header-text)', background: 'var(--theme-header-bg)', padding: '3px 7px' }}>ADMIN</span>}
                    {!u.is_active && <span style={{ fontFamily: 'var(--theme-font-display)', fontSize: 10, color: '#d63031' }}>INACTIVE</span>}
                    <button
                      style={rowBtnStyle(u.is_active ? '#d63031' : '#2ecc71', u.is_active ? '#8a1010' : '#1a8a4a')}
                      onClick={() => wrap(() => userMutations.update.mutateAsync({ id: u.id, data: { is_active: !u.is_active } }))}
                    >
                      {u.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>
                  </div>
                  {resetPasswordId === u.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        type="password"
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="新しいパスワード"
                        value={resetPasswordValue}
                        onChange={(e) => setResetPasswordValue(e.target.value)}
                      />
                      <button
                        style={rowBtnStyle('#525252', '#333')}
                        onClick={() => wrap(async () => {
                          await userMutations.resetPassword.mutateAsync({ id: u.id, password: resetPasswordValue })
                          setResetPasswordId(null); setResetPasswordValue('')
                        })}
                      >
                        SET
                      </button>
                      <button style={rowBtnStyle('#A0A0A0', '#666')} onClick={() => setResetPasswordId(null)}>X</button>
                    </div>
                  ) : (
                    <button
                      style={{ ...rowBtnStyle('#0984e3', '#055a9a'), alignSelf: 'flex-start' }}
                      onClick={() => setResetPasswordId(u.id)}
                    >
                      RESET PASSWORD
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
