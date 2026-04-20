import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import type { JobDetail } from '../../types/job'

function formatBudget(job: JobDetail) {
  if (job.budgetType === 'FIXED') return `FIXED ${job.fixedBudget ?? '—'}`
  return `HOURLY ${job.hourlyRate ?? '—'} × ${job.estimatedHours ?? '—'}`
}

export function JobDetailPage() {
  const { jobId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<JobDetail | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        if (!jobId) return
        const res = await jobApi.getJob(jobId)
        if (!cancelled) setJob(res)
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load job')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [jobId])

  if (loading) return <div className="hint">Loading job…</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!job) return <div className="alert">Not found</div>

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title">{job.title}</h1>
          <div className="row">
            <span className="pill pill-primary">{job.status}</span>
            <span className="pill">Employer: {job.employerId}</span>
            {job.deadline ? <span className="pill">Deadline: {job.deadline.slice(0, 10)}</span> : null}
          </div>
        </div>

        <div className="row">
          <Link className="btn" to="/jobs">
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad stack">
          <div style={{ fontWeight: 800 }}>Job details</div>
          <div className="divider" />
          <div className="kpi">
            <div className="label">Budget</div>
            <div className="value">{formatBudget(job)}</div>
          </div>
          <div className="kpi">
            <div className="label">Skills</div>
            <div className="value" style={{ fontWeight: 600 }}>
              {job.requiredSkills?.length ? job.requiredSkills.join(', ') : '—'}
            </div>
          </div>
          <div className="kpi">
            <div className="label">Created</div>
            <div className="value" style={{ fontWeight: 600 }}>
              {job.createdAt?.slice(0, 10)}
            </div>
          </div>
        </div>

        <div className="card card-pad stack">
          <div style={{ fontWeight: 800 }}>Description</div>
          <div className="divider" />
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--muted)' }}>{job.description}</div>
        </div>
      </div>
    </div>
  )
}
