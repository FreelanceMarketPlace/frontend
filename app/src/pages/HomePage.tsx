import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function HomePage() {
  const { user } = useAuth()

  const isEmployer  = user?.role === 'EMPLOYER'
  const isStaff     = user?.role === 'ADMIN' || user?.role === 'SUPPORTER'

  return (
    <div className="stack" style={{ gap: 16 }}>

      {/* ── Page header ── */}
      <div className="stack" style={{ gap: 4, paddingBottom: 8 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Quick links based on your role.</p>
      </div>

      {/* ── Browse Jobs — full-width hero card ── */}
      <div
        className="card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '56px 40px 44px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 20,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)',
          border: 'none',
          borderRadius: 20,
          minHeight: 260,
          justifyContent: 'center',
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
          borderRadius: 20,
        }}>
          <div style={{
            position: 'absolute', width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)',
            top: -80, right: -60,
          }} />
          <div style={{
            position: 'absolute', width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)',
            bottom: -40, left: 40,
          }} />
          {/* subtle grid lines */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <span style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 99,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.18)',
          position: 'relative',
        }}>
          Public
        </span>

        <div style={{ position: 'relative' }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>
            Browse Jobs
          </h2>
          <p style={{
            margin: '12px 0 0',
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 420,
            lineHeight: 1.6,
          }}>
            Explore job postings that are currently <strong style={{ color: 'rgba(255,255,255,0.85)' }}>OPEN</strong> and find your next opportunity.
          </p>
        </div>

        <Link
          to="/jobs"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 12,
            background: '#fff', color: '#1e3a5f',
            fontWeight: 700, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            position: 'relative',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-2px)'
            el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.transform = ''
            el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'
          }}
        >
          Go to Jobs
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* ── Role-gated cards ── */}
      {(isEmployer || isStaff) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isEmployer && isStaff ? '1fr 1fr' : '1fr',
          gap: 16,
        }}>

          {/* Employer card */}
          {isEmployer && (
            <div
              className="card"
              style={{
                position: 'relative', overflow: 'hidden',
                padding: '48px 36px 36px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', gap: 18,
                background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
                border: 'none', borderRadius: 20,
                minHeight: 220, justifyContent: 'center',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 20,
              }}>
                <div style={{
                  position: 'absolute', width: 260, height: 260, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)',
                  top: -60, right: -40,
                }} />
              </div>

              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 99,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.18)', position: 'relative',
              }}>Employer</span>

              <div style={{ position: 'relative' }}>
                <h2 style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.02em', lineHeight: 1.15,
                }}>
                  Manage Job Posts
                </h2>
                <p style={{
                  margin: '10px 0 0', fontSize: 14,
                  color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
                }}>
                  Create, edit, and close jobs you posted.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                <HeroLink to="/employer/jobs" label="My Jobs" light />
                <HeroLink to="/employer/jobs/new" label="+ Create Job" />
              </div>
            </div>
          )}

          {/* Admin / Supporter card */}
          {isStaff && (
            <div
              className="card"
              style={{
                position: 'relative', overflow: 'hidden',
                padding: '48px 36px 36px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', gap: 18,
                background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #7c3aed 100%)',
                border: 'none', borderRadius: 20,
                minHeight: 220, justifyContent: 'center',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 20,
              }}>
                <div style={{
                  position: 'absolute', width: 260, height: 260, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)',
                  top: -60, right: -40,
                }} />
              </div>

              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 99,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.18)', position: 'relative',
              }}>Admin</span>

              <div style={{ position: 'relative' }}>
                <h2 style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.02em', lineHeight: 1.15,
                }}>
                  User Management
                </h2>
                <p style={{
                  margin: '10px 0 0', fontSize: 14,
                  color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
                }}>
                  View and manage the users list.
                </p>
              </div>

              <HeroLink to="/admin/users" label="Users List" light />
            </div>
          )}
        </div>
      )}

      {/* ── Authentication — always at the bottom ── */}
      <div
        className="card card-pad"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          borderRadius: 14,
          padding: '18px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg-subtle, #f3f4f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>🔑</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Authentication</div>
            <div className="hint" style={{ fontSize: 12 }}>
              Login or register to access employer &amp; admin features.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn" to="/login">Login</Link>
          <Link className="btn btn-outline" to="/register">Register</Link>
        </div>
      </div>

    </div>
  )
}

function HeroLink({
  to, label, light,
}: { to: string; label: string; light?: boolean }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '10px 22px', borderRadius: 10,
        fontWeight: 700, fontSize: 14, textDecoration: 'none',
        transition: 'transform 0.15s, box-shadow 0.15s',
        ...(light
          ? { background: '#fff', color: '#064e3b', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }
          : { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }
        ),
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = light ? '0 2px 10px rgba(0,0,0,0.2)' : ''
      }}
    >
      {label}
    </Link>
  )
}