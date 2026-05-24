import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      nav(from, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

        .login-wrap {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
          animation: loginFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(24px) }
          to   { opacity: 1; transform: translateY(0) }
        }

        .login-hero {
          position: relative;
          padding: 40px 40px 36px;
          background: linear-gradient(145deg, #0c1f3a 0%, #0f3460 50%, #16213e 100%);
          overflow: hidden;
        }

        .login-hero-bg-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .login-hero-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 38px;
          font-weight: 400;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.15;
          position: relative;
          z-index: 1;
        }

        .login-hero-title em {
          font-style: italic;
          color: #93c5fd;
        }

        .login-hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin: 0;
          position: relative;
          z-index: 1;
          line-height: 1.5;
        }

        .login-body {
          padding: 36px 40px 40px;
          background: var(--bg-card, #fff);
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .login-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted, #6b7280);
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: var(--bg-subtle, #f9fafb);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: var(--text, #111827);
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          outline: none;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .login-input.has-toggle {
          padding-right: 48px;
        }

        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: var(--text-muted, #9ca3af);
          display: flex;
          align-items: center;
          transition: color 0.15s;
          border-radius: 6px;
        }

        .pw-toggle:hover { color: #374151; }

        .login-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          line-height: 1.5;
          animation: loginFadeUp 0.2s ease;
        }

        .login-submit {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          position: relative;
          overflow: hidden;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.45);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-submit-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg) } }

        .login-footer {
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: var(--text-muted, #6b7280);
          padding-top: 4px;
        }

        .login-footer a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }

        .login-footer a:hover { text-decoration: underline; }

        .login-dots {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .login-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
      `}</style>

      <div className="login-wrap">
        <div className="login-card">

          {/* ── Hero panel ── */}
          <div className="login-hero">
            {/* Background orbs */}
            <div className="login-hero-bg-circle" style={{
              width: 280, height: 280,
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
              top: -80, right: -60,
            }} />
            <div className="login-hero-bg-circle" style={{
              width: 160, height: 160,
              background: 'radial-gradient(circle, rgba(147,197,253,0.1) 0%, transparent 70%)',
              bottom: -30, left: 20,
            }} />

            <div className="login-dots">
              <div className="login-dot" style={{ background: '#ef4444' }} />
              <div className="login-dot" style={{ background: '#f59e0b' }} />
              <div className="login-dot" style={{ background: '#22c55e' }} />
            </div>

            <h1 className="login-hero-title">
              Welcome<br /><em>back.</em>
            </h1>
            <p className="login-hero-sub">
              Sign in to your account to continue.
            </p>
          </div>

          {/* ── Form body ── */}
          <div className="login-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Email */}
              <div className="login-field">
                <label className="login-label" htmlFor="email">Email</label>
                <div className="login-input-wrap">
                  <input
                    id="email"
                    className="login-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label" htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <input
                    id="password"
                    className={`login-input has-toggle`}
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="login-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button className="login-submit" type="submit" disabled={loading}>
                {loading && <span className="login-submit-spinner" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              {/* Footer */}
              <p className="login-footer">
                Don't have an account?{' '}
                <Link to="/register">Create one</Link>
              </p>

            </form>
          </div>

        </div>
      </div>
    </>
  )
}