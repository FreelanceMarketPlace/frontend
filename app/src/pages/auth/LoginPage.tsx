import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <div className="stack">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title">Welcome back</h1>
          <p className="page-subtitle">Sign in to continue. Refresh token is stored in an HttpOnly cookie.</p>
        </div>

        <div className="card card-pad stack" style={{ maxWidth: 520 }}>
          <form
            className="stack"
            onSubmit={async (e) => {
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
            }}
          >
            <div className="stack" style={{ gap: 6 }}>
              <label className="hint" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="stack" style={{ gap: 6 }}>
              <label className="hint" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="hint">
                No account? <Link to="/register">Register</Link>
              </span>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="stack" style={{ justifyContent: 'start' }}>
        <div className="card card-pad stack">
          <div className="stack" style={{ gap: 6 }}>
            <div className="pill pill-primary">Demo flow</div>
            <div className="kpi">
              <div className="label">Employer</div>
              <div className="value">Create / Edit / Close jobs</div>
            </div>
            <div className="divider" />
            <div className="kpi">
              <div className="label">Public</div>
              <div className="value">Browse jobs</div>
            </div>
            <div className="divider" />
            <div className="kpi">
              <div className="label">Admin / Supporter</div>
              <div className="value">View users list</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
