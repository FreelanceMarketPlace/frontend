import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useState } from 'react'
import './AppLayout.css'

export function AppLayout() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
              {user?.role === 'FREELANCER' ? <Link to="/freelancer/contracts">My Contracts</Link> : null}
              {user?.role === 'EMPLOYER' ? <Link to="/employer/jobs">Employer</Link> : null}
              {user?.role === 'EMPLOYER' ? <Link to="/employer/contracts">Contracts</Link> : null}
              {user?.role === 'ADMIN' || user?.role === 'SUPPORTER' ? <Link to="/admin/users">Admin</Link> : null}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
            <div className="app-header-mobile-menu">
              <button
                className="app-header-hamburger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </button>
              <nav className={`app-header-mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
                {user?.role === 'FREELANCER' ? <Link to="/freelancer/proposals" onClick={() => setMobileMenuOpen(false)}>My Proposals</Link> : null}
                {user?.role === 'FREELANCER' ? <Link to="/freelancer/offers" onClick={() => setMobileMenuOpen(false)}>My Offers</Link> : null}
                {user?.role === 'FREELANCER' ? <Link to="/freelancer/contracts" onClick={() => setMobileMenuOpen(false)}>My Contracts</Link> : null}
                {user?.role === 'EMPLOYER' ? <Link to="/employer/jobs" onClick={() => setMobileMenuOpen(false)}>Employer</Link> : null}
                {user?.role === 'EMPLOYER' ? <Link to="/employer/contracts" onClick={() => setMobileMenuOpen(false)}>Contracts</Link> : null}
                {user?.role === 'ADMIN' || user?.role === 'SUPPORTER' ? <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)}>Admin</Link> : null}
              </nav>
            </div>

            <div className="header-user-menu">
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
