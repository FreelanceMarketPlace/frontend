import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import type { RegisterRequest } from '../../types/user'

export function RegisterPage() {
  const { register } = useAuth()
  const nav = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RegisterRequest['role']>('FREELANCER')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="page-title">Create your account</h1>
        <p className="page-subtitle">Choose role Employer to post jobs, Freelancer to browse/apply later.</p>
      </div>

      <div className="card card-pad stack">
        <form
          className="stack"
          onSubmit={async (e) => {
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
          }}
        >
          <div className="grid grid-2">
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
              <label className="hint" htmlFor="role">
                Role
              </label>
              <select id="role" className="select" value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="FREELANCER">FREELANCER</option>
                <option value="EMPLOYER">EMPLOYER</option>
              </select>
            </div>
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
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <div className="hint">Your password is never stored in the browser.</div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="hint">
              Already have an account? <Link to="/login">Login</Link>
            </span>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
