import { useState } from 'react'
import { useDomains, useDomainMutations } from '../../hooks/useDomains'
import { useTags, useTagMutations } from '../../hooks/useTags'
import { useUsers, useUserMutations } from '../../hooks/useUsers'

interface Props {
  onClose: () => void
}

type Tab = 'domains' | 'tags' | 'users'

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 8,
  padding: '6px 12px',
  border: '2px solid #333',
  background: active ? '#333' : '#C0C0C0',
  color: active ? '#f9ca24' : '#333',
  cursor: 'pointer',
  letterSpacing: 1,
})

const inputStyle: React.CSSProperties = {
  background: '#fff',
  border: '2px solid #333',
  padding: '4px 6px',
  fontFamily: 'monospace',
  fontSize: 11,
  outline: 'none',
}

const rowBtnStyle = (color: string, shadow: string): React.CSSProperties => ({
  background: color,
  color: '#fff',
  border: '2px solid #333',
  boxShadow: `2px 2px 0 ${shadow}`,
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 7,
  padding: '3px 6px',
  cursor: 'pointer',
})

export default function AdminModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('domains')
  const [error, setError] = useState('')

  // Domains
  const { data: domains = [] } = useDomains()
  const domainMutations = useDomainMutations()
  const [newDomainName, setNewDomainName] = useState('')
  const [newDomainDesc, setNewDomainDesc] = useState('')

  // Tags
  const { data: tags = [] } = useTags()
  const tagMutations = useTagMutations()
  const [newTagName, setNewTagName] = useState('')

  // Users
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
          zIndex: 101, width: 700, maxHeight: '85vh', background: '#ECECEC',
          border: '3px solid #333', boxShadow: '6px 6px 0 #525252',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ background: '#333', color: '#f9ca24', fontFamily: "'Press Start 2P', monospace", fontSize: 9, padding: '7px 12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>ADMIN PANEL</span>
          <span style={{ cursor: 'pointer', color: '#d63031' }} onClick={onClose}>[ X ]</span>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '3px solid #333', background: '#C0C0C0' }}>
          {(['domains', 'tags', 'users'] as Tab[]).map((t) => (
            <button key={t} style={tabBtnStyle(tab === t)} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#d63031', background: '#ffe0e0', border: '1px solid #d63031', padding: '4px 8px', margin: '4px 8px 0' }}>
            {error}
          </div>
        )}

        {/* タブコンテンツ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

          {/* ドメイン管理 */}
          {tab === 'domains' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: '#D8D8D8', border: '2px solid #A0A0A0' }}>
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
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#fff', border: '2px solid #C0C0C0' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, flex: 1 }}>{d.name}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, flex: 2, color: '#666' }}>{d.description}</span>
                  <button style={rowBtnStyle('#d63031', '#8a1010')} onClick={() => wrap(() => domainMutations.remove.mutateAsync(d.id))}>DEL</button>
                </div>
              ))}
            </div>
          )}

          {/* タグ管理 */}
          {tab === 'tags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: '#D8D8D8', border: '2px solid #A0A0A0' }}>
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
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#fff', border: '2px solid #C0C0C0' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, flex: 1 }}>{t.name}</span>
                  <button style={rowBtnStyle('#d63031', '#8a1010')} onClick={() => wrap(() => tagMutations.remove.mutateAsync(t.id))}>DEL</button>
                </div>
              ))}
            </div>
          )}

          {/* ユーザー管理 */}
          {tab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: '#D8D8D8', border: '2px solid #A0A0A0', flexWrap: 'wrap' }}>
                <input style={{ ...inputStyle, width: 140 }} placeholder="ユーザー名" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                <input type="password" style={{ ...inputStyle, width: 140 }} placeholder="パスワード" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <label style={{ fontFamily: 'monospace', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
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
                <div key={u.id} style={{ padding: '6px 8px', background: '#fff', border: '2px solid #C0C0C0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, flex: 1 }}>{u.username}</span>
                    {u.is_admin && <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#f9ca24', background: '#333', padding: '2px 5px' }}>ADMIN</span>}
                    {!u.is_active && <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#d63031' }}>INACTIVE</span>}
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
