import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import * as proposalApi from '../../api/proposalApi'
import type { JobListItem } from '../../types/job'
import type { ProposalResponse, ProposalStatus } from '../../types/proposal'

function budgetText(j: JobListItem) {
  if (j.budgetType === 'FIXED') return `FIXED ${j.fixedBudget ?? '—'}`
  return `HOURLY ${j.hourlyRate ?? '—'} × ${j.estimatedHours ?? '—'}`
}

const statusColors: Record<ProposalStatus, string> = {
  PENDING: 'pill-primary',
  SHORTLISTED: 'pill-success',
  REJECTED: 'pill-error',
  WITHDRAWN: 'pill-muted',
}

export function EmployerJobsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<JobListItem[]>([])
  const [status, setStatus] = useState<string>('')
  const [closingId, setClosingId] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [proposalsError, setProposalsError] = useState<string | null>(null)

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

  const loadProposals = async (jobId: string) => {
    setSelectedJobId(jobId)
    setProposalsLoading(true)
    setProposalsError(null)
    try {
      const res = await proposalApi.getJobProposals(jobId)
      setProposals(res.items)
    } catch (err: any) {
      setProposalsError(err?.response?.data?.message ?? err?.message ?? 'Failed to load proposals')
    } finally {
      setProposalsLoading(false)
    }
  }

  const handleShortlistProposal = async (proposalId: string) => {
    try {
      await proposalApi.shortlistProposal(proposalId)
      if (selectedJobId) {
        await loadProposals(selectedJobId)
      }
    } catch (err: any) {
      setProposalsError(err?.response?.data?.message ?? err?.message ?? 'Failed to shortlist proposal')
    }
  }

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await proposalApi.rejectProposal(proposalId)
      if (selectedJobId) {
        await loadProposals(selectedJobId)
      }
    } catch (err: any) {
      setProposalsError(err?.response?.data?.message ?? err?.message ?? 'Failed to reject proposal')
    }
  }

  const handleCreateOffer = async (proposal: ProposalResponse) => {
    try {
      const selectedJob = items.find((job) => job.id === selectedJobId)
      if (!selectedJob) {
        setProposalsError('Job not found for creating offer')
        return
      }

      await proposalApi.createOffer(proposal.id, {
        estimatedDuration: proposal.estimatedDuration,
        jobDescription: `Offer for job: ${selectedJob.title}`,
      })
      if (selectedJobId) {
        await loadProposals(selectedJobId)
      }
    } catch (err: any) {
      setProposalsError(err?.response?.data?.message ?? err?.message ?? 'Failed to create offer')
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
                <button className="btn" type="button" onClick={() => loadProposals(j.id)}>
                  Proposals ({j.proposalCount})
                </button>
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

      {selectedJobId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card card-pad" style={{ maxWidth: 700, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                Proposals for {items.find((j) => j.id === selectedJobId)?.title}
              </div>
              <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} onClick={() => setSelectedJobId(null)}>
                ✕
              </button>
            </div>
            <div className="divider" />

            {proposalsError && <div className="alert alert-error" style={{ marginBottom: 12 }}>{proposalsError}</div>}

            {proposalsLoading ? (
              <div className="hint">Loading proposals…</div>
            ) : proposals.length === 0 ? (
              <div className="hint">No proposals yet</div>
            ) : (
              <div className="stack" style={{ gap: 12 }}>
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="card card-pad stack" style={{ gap: 10, backgroundColor: 'var(--muted-bg)' }}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="stack" style={{ gap: 4, flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Freelancer: {proposal.freelancerId}</div>
                        <div className="row" style={{ gap: 8 }}>
                          <span className={`pill ${statusColors[proposal.status]}`}>{proposal.status}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ color: 'var(--muted)', fontSize: 14, whiteSpace: 'pre-wrap' }}>{proposal.coverLetter}</div>
                    <div className="hint" style={{ fontSize: 12 }}>Estimated duration: {proposal.estimatedDuration} days</div>

                    {proposal.status === 'PENDING' && (
                      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleRejectProposal(proposal.id)}
                          style={{ color: 'var(--error)' }}
                        >
                          Reject
                        </button>
                        <button className="btn btn-primary" onClick={() => handleShortlistProposal(proposal.id)}>
                          Shortlist
                        </button>
                      </div>
                    )}

                    {proposal.status === 'SHORTLISTED' && (
                      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => handleCreateOffer(proposal)}>
                          Create Offer
                        </button>
                      </div>
                    )}

                    <div className="hint" style={{ fontSize: 12 }}>
                      Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
