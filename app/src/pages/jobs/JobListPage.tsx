import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import type { JobListItem } from '../../types/job'

export function JobListPage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<JobListItem[]>([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await jobApi.listJobs({ q: q || undefined, page: 0, size: 20 })
      setItems(res.items)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="stack" style={{ gap: 6, marginBottom: 12 }}>
        <h1 className="page-title">Browse jobs</h1>
        <p className="page-subtitle">Public listing shows only OPEN jobs.</p>
      </div>

      <div className="card card-pad stack" style={{ marginBottom: 12 }}>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
        >
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title/description…"
            style={{ flex: 1, minWidth: 240 }}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
        <div className="hint">Tip: Try keywords like “react”, “java”, “designer”.</div>
      </div>

      {error ? (
        <div className="alert alert-error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {loading ? <div className="hint">Loading jobs…</div> : null}

      {!loading && items.length === 0 ? <div className="alert">No jobs found.</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        {items.map((j) => (
          <div key={j.id} className="card card-pad stack" style={{ gap: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stack" style={{ gap: 4 }}>
                <div style={{ fontWeight: 800, letterSpacing: '-0.2px' }}>{j.title}</div>
                <div className="hint">Skills: {j.requiredSkills?.length ? j.requiredSkills.join(', ') : '—'}</div>
              </div>
              <span className="pill pill-primary">{j.status}</span>
            </div>

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="hint">
                Budget:{' '}
                {j.budgetType === 'FIXED'
                  ? `FIXED ${j.fixedBudget ?? '—'}`
                  : `HOURLY ${j.hourlyRate ?? '—'} × ${j.estimatedHours ?? '—'}`}
              </div>

              <Link className="btn" to={`/jobs/${j.id}`}>
                View detail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
