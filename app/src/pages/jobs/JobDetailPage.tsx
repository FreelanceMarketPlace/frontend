import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import * as proposalApi from '../../api/proposalApi'
import { useAuth } from '../../auth/AuthContext'
import type { JobDetail } from '../../types/job'
import type { SubmitProposalRequest } from '../../types/proposal'

function formatBudget(job: JobDetail) {
  if (job.budgetType === 'FIXED') return `FIXED ${job.fixedBudget ?? '—'}`
  return `HOURLY ${job.hourlyRate ?? '—'} × ${job.estimatedHours ?? '—'}`
}

export function JobDetailPage() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<JobDetail | null>(null)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [proposalCoverLetter, setProposalCoverLetter] = useState<string>('')
  const [proposalEstimatedDuration, setProposalEstimatedDuration] = useState<string>('')
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalError, setProposalError] = useState<string | null>(null)

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

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setProposalError(null)
    setProposalLoading(true)

    try {
      if (!jobId) return

      const req: SubmitProposalRequest = {
        coverLetter: proposalCoverLetter,
        estimatedDuration: Number(proposalEstimatedDuration),
      }

      await proposalApi.submitProposal(jobId, req)
      setShowProposalModal(false)
      setProposalCoverLetter('')
      setProposalEstimatedDuration('')
      setProposalError(null)
      // Optionally refresh job data to see updated proposal count
      const updatedJob = await jobApi.getJob(jobId)
      setJob(updatedJob)
    } catch (err: any) {
      setProposalError(err?.response?.data?.message ?? err?.message ?? 'Failed to submit proposal')
    } finally {
      setProposalLoading(false)
    }
  }

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
            <span className="pill">{job.proposalCount} proposals</span>
          </div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          {user && user.role === 'FREELANCER' && job.status === 'OPEN' && (
            <button className="btn btn-primary" onClick={() => setShowProposalModal(true)}>
              Submit Proposal
            </button>
          )}
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

      {showProposalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card card-pad" style={{ maxWidth: 500, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Submit Proposal</div>
              <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} onClick={() => setShowProposalModal(false)}>
                ✕
              </button>
            </div>
            <div className="divider" />
            <form className="stack" onSubmit={handleSubmitProposal} style={{ gap: 12 }}>
              <div className="stack" style={{ gap: 6 }}>
                <label className="hint">Cover Letter</label>
                <textarea
                  className="input"
                  value={proposalCoverLetter}
                  onChange={(e) => setProposalCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and why you're a good fit for this job..."
                  minLength={10}
                  maxLength={500}
                  required
                  rows={4}
                />
              </div>

              <div className="stack" style={{ gap: 6 }}>
                <label className="hint">Estimated Duration (days)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={proposalEstimatedDuration}
                  onChange={(e) => setProposalEstimatedDuration(e.target.value)}
                  placeholder="e.g. 14"
                  required
                />
              </div>

              {proposalError && <div className="alert alert-error">{proposalError}</div>}

              <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowProposalModal(false)} disabled={proposalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={proposalLoading}>
                  {proposalLoading ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
