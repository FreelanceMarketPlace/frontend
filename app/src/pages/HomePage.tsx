import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function HomePage() {
  const { user } = useAuth()

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Quick links based on your role.</p>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad stack">
          <div className="pill pill-primary">Public</div>
          <div style={{ fontWeight: 800 }}>Browse jobs</div>
          <div className="hint">Explore job postings that are currently OPEN.</div>
          <div className="row">
            <Link className="btn btn-primary" to="/jobs">
              Go to Jobs
            </Link>
          </div>
        </div>

        <div className="card card-pad stack">
          <div className="pill">Account</div>
          <div style={{ fontWeight: 800 }}>Authentication</div>
          <div className="hint">Login/register to access employer/admin features.</div>
          <div className="row">
            <Link className="btn" to="/login">
              Login
            </Link>
            <Link className="btn" to="/register">
              Register
            </Link>
          </div>
        </div>
      </div>

      {user?.role === 'EMPLOYER' ? (
        <div className="card card-pad stack">
          <div className="pill pill-primary">Employer</div>
          <div style={{ fontWeight: 800 }}>Manage your job posts</div>
          <div className="hint">Create, edit, and close jobs you posted.</div>
          <div className="row">
            <Link className="btn btn-primary" to="/employer/jobs">
              My Jobs
            </Link>
            <Link className="btn" to="/employer/jobs/new">
              Create Job
            </Link>
          </div>
        </div>
      ) : null}

      {user?.role === 'ADMIN' || user?.role === 'SUPPORTER' ? (
        <div className="card card-pad stack">
          <div className="pill pill-primary">Admin</div>
          <div style={{ fontWeight: 800 }}>Users</div>
          <div className="hint">View users list (role-gated route).</div>
          <div className="row">
            <Link className="btn btn-primary" to="/admin/users">
              Users list
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
