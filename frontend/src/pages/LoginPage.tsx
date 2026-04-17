import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { loginMutation } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await loginMutation.mutateAsync({ username, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#D8D8D8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '8px 8px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* タイトル */}
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 14,
            color: '#333',
            textAlign: 'center',
            lineHeight: 2,
          }}
        >
          ** ANALYSIS **
          <br />
          ** COOKBOOKS **
        </div>

        {/* ログインボックス */}
        <div
          style={{
            background: '#ECECEC',
            border: '3px solid #333',
            boxShadow: '4px 4px 0 #525252',
            padding: 0,
            width: 300,
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              background: '#333',
              color: '#f9ca24',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 10,
              padding: '8px 12px',
              letterSpacing: 2,
            }}
          >
            - LOGIN -
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#525252' }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  background: '#fff',
                  border: '2px solid #333',
                  boxShadow: 'inset 2px 2px 0 #A0A0A0',
                  padding: '6px 8px',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#525252' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  background: '#fff',
                  border: '2px solid #333',
                  boxShadow: 'inset 2px 2px 0 #A0A0A0',
                  padding: '6px 8px',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: '#d63031',
                  background: '#ffe0e0',
                  border: '1px solid #d63031',
                  padding: '4px 8px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                background: loginMutation.isPending ? '#A0A0A0' : '#2ecc71',
                color: '#fff',
                border: '2px solid #333',
                boxShadow: loginMutation.isPending ? 'none' : '3px 3px 0 #1a8a4a',
                padding: '8px 12px',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
              }}
            >
              {loginMutation.isPending ? 'LOADING...' : '[ LOGIN ]'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
