import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import type { JobListItem } from '../../types/job'

function budgetText(j: JobListItem) {
  if (j.budgetType === 'FIXED') return `FIXED ${j.fixedBudget ?? '—'}`
  return `HOURLY ${j.hourlyRate ?? '—'} × ${j.estimatedHours ?? '—'}`
}

export function EmployerJobsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<JobListItem[]>([])
  const [status, setStatus] = useState<string>('')
  const [closingId, setClosingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await jobApi.listEmployerJobs({ status: status || undefined, page: 0, size: 20 })
      setItems(res.items)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load employer jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function closeJob(jobId: string) {
    setClosingId(jobId)
    setError(null)
    try {
      await jobApi.closeJob(jobId)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Close failed')
    } finally {
      setClosingId(null)
    }
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title">My jobs</h1>
          <p className="page-subtitle">Create, edit, and close your job postings.</p>
        </div>
        <div className="row">
          <Link className="btn btn-primary" to="/employer/jobs/new">
            Create job
          </Link>
        </div>
      </div>

      <div className="card card-pad stack">
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
        >
          <input
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Filter status (e.g. OPEN)"
            style={{ flex: 1, minWidth: 240 }}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Loading…' : 'Apply'}
          </button>
        </form>
        <div className="hint">Leave empty to show all. Close action is available for editable jobs.</div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="hint">Loading…</div> : null}

      {!loading && items.length === 0 ? <div className="alert">No jobs yet.</div> : null}

      <div className="grid">
        {items.map((j) => (
          <div key={j.id} className="card card-pad stack" style={{ gap: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stack" style={{ gap: 4 }}>
                <div style={{ fontWeight: 800, letterSpacing: '-0.2px' }}>{j.title}</div>
                <div className="hint">Budget: {budgetText(j)}</div>
              </div>
              <span className="pill pill-primary">{j.status}</span>
            </div>

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="row">
                <Link className="btn" to={`/jobs/${j.id}`}>
                  View
                </Link>
                <Link className="btn" to={`/employer/jobs/${j.id}/edit`}>
                  Edit
                </Link>
              </div>

              <button
                className="btn btn-danger"
                type="button"
                disabled={closingId === j.id}
                onClick={() => closeJob(j.id)}
                title="Close job"
              >
                {closingId === j.id ? 'Closing…' : 'Close'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
