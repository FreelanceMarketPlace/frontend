import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container header-row">
          <div className="row" style={{ gap: 12 }}>
            <Link to="/" className="brand">
              Freelance Marketplace
            </Link>
            <nav className="nav">
              <Link to="/jobs">Jobs</Link>
              {user?.role === 'FREELANCER' ? <Link to="/freelancer/proposals">My Proposals</Link> : null}
              {user?.role === 'FREELANCER' ? <Link to="/freelancer/offers">My Offers</Link> : null}
              {user?.role === 'EMPLOYER' ? <Link to="/employer/jobs">Employer</Link> : null}
              {user?.role === 'ADMIN' || user?.role === 'SUPPORTER' ? <Link to="/admin/users">Admin</Link> : null}
            </nav>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            {user ? (
              <>
                <span className="pill">
                  {user.email} · {user.role}
                </span>
                <button className="btn btn-ghost" onClick={() => logout()}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">Demo UI scaffold — user/admin + job posting</div>
      </footer>
    </div>
  )
}
