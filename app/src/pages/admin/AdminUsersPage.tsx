import { useEffect, useState } from 'react'
import * as userApi from '../../api/userApi'
import type { UserResponse } from '../../types/user'

export function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<UserResponse[]>([])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await userApi.listUsers(0, 50)
        if (!cancelled) setItems(res.items)
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load users')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div className="hint">Loading users…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">Admin/Supporter-only page. Read-only list for demo.</p>
      </div>

      <div className="card card-pad stack" style={{ gap: 10 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row">
            <span className="pill pill-primary">Total: {items.length}</span>
          </div>
          <div className="hint">Endpoint: GET /users</div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u: UserResponse) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={u.role === 'ADMIN' ? 'pill pill-primary' : 'pill pill-muted'}>{u.role}</span>
                  </td>
                  <td>
                    <span className={u.status === 'BANNED' ? 'pill pill-danger' : 'pill pill-muted'}>{u.status}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
