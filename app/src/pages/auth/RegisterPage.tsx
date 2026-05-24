import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import type { RegisterRequest } from '../../types/user'

type Role = RegisterRequest['role']

const ROLES: { value: Role; label: string; desc: string; icon: string }[] = [
  {
    value: 'FREELANCER',
    label: 'Freelancer',
    desc: 'Browse & apply for jobs',
    icon: '',
  },
  {
    value: 'EMPLOYER',
    label: 'Employer',
    desc: 'Post jobs & hire talent',
    icon: '',
  },
]

export function RegisterPage() {
  const { register } = useAuth()
  const nav = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [role, setRole]         = useState<Role>('FREELANCER')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const pwStrength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ email, password, role })
      nav('/login')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

        .reg-wrap {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        .reg-card {
          width: 100%;
          max-width: 480px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
          animation: regFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes regFadeUp {
          from { opacity: 0; transform: translateY(24px) }
          to   { opacity: 1; transform: translateY(0) }
        }

        /* ── Hero ── */
        .reg-hero {
          position: relative;
          padding: 40px 40px 36px;
          background: linear-gradient(145deg, #1a0533 0%, #3b0764 55%, #4c1d95 100%);
          overflow: hidden;
        }

        .reg-hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .reg-hero-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 38px;
          font-weight: 400;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.15;
          position: relative;
          z-index: 1;
        }

        .reg-hero-title em {
          font-style: italic;
          color: #c4b5fd;
        }

        .reg-hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin: 0;
          position: relative;
          z-index: 1;
          line-height: 1.5;
        }

        .reg-dots {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .reg-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        /* ── Body ── */
        .reg-body {
          padding: 36px 40px 40px;
          background: var(--bg-card, #fff);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Field ── */
        .reg-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .reg-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted, #6b7280);
        }

        .reg-input-wrap { position: relative; }

        .reg-input {
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

        .reg-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }

        .reg-input.has-toggle { padding-right: 48px; }

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

        /* ── Role toggle ── */
        .role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border-radius: 14px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: var(--bg-subtle, #f9fafb);
          cursor: pointer;
          transition: all 0.18s;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .role-btn:hover:not(.role-btn--active) {
          border-color: #a78bfa;
          background: #faf5ff;
        }

        .role-btn--active {
          border-color: #7c3aed;
          background: #faf5ff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }

        .role-btn-icon {
          font-size: 22px;
          line-height: 1;
        }

        .role-btn-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text, #111827);
        }

        .role-btn-desc {
          font-size: 11px;
          color: var(--text-muted, #9ca3af);
          line-height: 1.4;
        }

        .role-btn--active .role-btn-label { color: #5b21b6; }
        .role-btn--active .role-btn-desc  { color: #7c3aed; opacity: 0.8; }

        /* ── Password strength ── */
        .pw-strength-bars {
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }

        .pw-bar {
          flex: 1;
          height: 3px;
          border-radius: 99px;
          background: var(--border, #e5e7eb);
          transition: background 0.3s;
        }

        .pw-bar--weak   { background: #ef4444; }
        .pw-bar--fair   { background: #f59e0b; }
        .pw-bar--good   { background: #3b82f6; }
        .pw-bar--strong { background: #22c55e; }

        .pw-hint {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          margin-top: 5px;
          transition: color 0.3s;
        }

        /* ── Error ── */
        .reg-error {
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
          animation: regFadeUp 0.2s ease;
        }

        /* ── Submit ── */
        .reg-submit {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #5b21b6, #7c3aed);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(109,40,217,0.4);
        }

        .reg-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(109,40,217,0.5);
        }

        .reg-submit:active:not(:disabled) { transform: translateY(0); }

        .reg-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .reg-spinner {
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

        .reg-footer {
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: var(--text-muted, #6b7280);
        }

        .reg-footer a {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
        }

        .reg-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="reg-wrap">
        <div className="reg-card">

          {/* ── Hero panel ── */}
          <div className="reg-hero">
            <div className="reg-hero-orb" style={{
              width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
              top: -80, right: -60,
            }} />
            <div className="reg-hero-orb" style={{
              width: 180, height: 180,
              background: 'radial-gradient(circle, rgba(196,181,253,0.1) 0%, transparent 70%)',
              bottom: -40, left: 20,
            }} />

            <div className="reg-dots">
              <div className="reg-dot" style={{ background: '#ef4444' }} />
              <div className="reg-dot" style={{ background: '#f59e0b' }} />
              <div className="reg-dot" style={{ background: '#22c55e' }} />
            </div>

            <h1 className="reg-hero-title">
              Join us<br /><em>today.</em>
            </h1>
            <p className="reg-hero-sub">
              Create your account and get started in seconds.
            </p>
          </div>

          {/* ── Form body ── */}
          <div className="reg-body">
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>

              {/* Role picker */}
              <div className="reg-field">
                <span className="reg-label">I am a…</span>
                <div className="role-grid">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      className={`role-btn${role === r.value ? ' role-btn--active' : ''}`}
                      onClick={() => setRole(r.value)}
                    >
                      <span className="role-btn-icon">{r.icon}</span>
                      <span className="role-btn-label">{r.label}</span>
                      <span className="role-btn-desc">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="email">Email</label>
                <div className="reg-input-wrap">
                  <input
                    id="email"
                    className="reg-input"
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
              <div className="reg-field">
                <label className="reg-label" htmlFor="password">Password</label>
                <div className="reg-input-wrap">
                  <input
                    id="password"
                    className="reg-input has-toggle"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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

                {/* Strength meter */}
                {password.length > 0 && (
                  <>
                    <div className="pw-strength-bars">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`pw-bar${i < pwStrength.score ? ` pw-bar--${pwStrength.level}` : ''}`}
                        />
                      ))}
                    </div>
                    <p className="pw-hint" style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </p>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="reg-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button className="reg-submit" type="submit" disabled={loading}>
                {loading && <span className="reg-spinner" />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>

              {/* Footer */}
              <p className="reg-footer">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </p>

            </form>
          </div>

        </div>
      </div>
    </>
  )
}

/* ── Password strength helper ── */
function getPasswordStrength(pw: string): {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  label: string
  color: string
} {
  if (pw.length === 0) return { score: 0, level: 'weak', label: '', color: '' }

  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score: 1, level: 'weak',   label: 'Weak — add numbers or symbols',      color: '#ef4444' }
  if (score === 2) return { score: 2, level: 'fair',   label: 'Fair — try mixing cases & symbols',  color: '#f59e0b' }
  if (score === 3) return { score: 3, level: 'good',   label: 'Good — almost there!',               color: '#3b82f6' }
  return               { score: 4, level: 'strong', label: 'Strong password ✓',                  color: '#22c55e' }
}