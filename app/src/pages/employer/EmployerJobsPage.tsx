import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import * as proposalApi from '../../api/proposalApi'
import type { JobListItem } from '../../types/job'
import type { ProposalResponse, ProposalStatus } from '../../types/proposal'
import './EmployerJobsPage.css'

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
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const PAGE_SIZE = 20
  const [closingId, setClosingId] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [proposalsError, setProposalsError] = useState<string | null>(null)

  async function load(pageNum: number = 0) {
    setLoading(true)
    setError(null)
    try {
      const res = await jobApi.listEmployerJobs({ status: status || undefined, page: pageNum, size: PAGE_SIZE })
      setItems(res.items)
      setPage(res.page)
      setTotalPages(res.totalPages)
      setTotalElements(res.totalElements)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load employer jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(0)
  }, [status])

  async function closeJob(jobId: string) {
    setClosingId(jobId)
    setError(null)
    try {
      await jobApi.closeJob(jobId)
      await load(page)
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

  const handleDownloadAttachment = async (proposalId: string, attachment: any) => {
    try {
      const blob = await proposalApi.downloadProposalAttachment(proposalId, attachment)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = attachment.fileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setProposalsError(err?.response?.data?.message ?? err?.message ?? 'Failed to download attachment')
    }
  }

  return (
    <div className="employer-jobs-page stack" style={{ gap: 14 }}>
      <div className="employer-jobs-header">
        <div className="employer-jobs-title">
          <h1 className="page-title">My jobs</h1>
          <p className="page-subtitle">Create, edit, and close your job postings.</p>
        </div>
        <div className="employer-jobs-actions">
          <Link className="btn btn-primary" to="/employer/jobs/new">
            Create job
          </Link>
        </div>
      </div>

      <div className="card card-pad stack">
        <form
          className="employer-jobs-filter"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(0)
            load(0)
          }}
        >
          <input
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Filter status (e.g. OPEN)"
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

      <div className="jobs-grid">
        {items.map((j) => (
          <div key={j.id} className="card card-pad job-card">
            <div className="job-card-header">
              <div className="job-card-title">
                <div style={{ fontWeight: 800, letterSpacing: '-0.2px' }}>{j.title}</div>
                <div className="hint">Budget: {budgetText(j)}</div>
              </div>
              <span className="pill pill-primary">{j.status}</span>
            </div>

            <div className="job-card-actions">
              <div className="job-card-buttons">
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

      {!loading && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="btn btn-outline"
            disabled={page === 0}
            onClick={() => load(Math.max(0, page - 1))}
          >
            ← Previous
          </button>
          <div className="hint" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Page {page + 1} of {totalPages}</span>
            <span style={{ fontSize: 12 }}>({totalElements} total)</span>
          </div>
          <button
            className="btn btn-outline"
            disabled={page >= totalPages - 1}
            onClick={() => load(Math.min(totalPages - 1, page + 1))}
          >
            Next →
          </button>
        </div>
      )}

      {selectedJobId && (
        <div className="proposals-modal">
          <div className="proposals-modal-content">
            <div className="proposals-modal-header">
              <div className="proposals-modal-title">
                Proposals for {items.find((j) => j.id === selectedJobId)?.title}
              </div>
              <button className="proposals-modal-close" onClick={() => setSelectedJobId(null)}>
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
                  <div key={proposal.id} className="card card-pad proposal-card">
                    <div className="proposal-status-row">
                      <div className="stack" style={{ gap: 4, flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Freelancer: {proposal.freelancerId}</div>
                        <div className="row" style={{ gap: 8 }}>
                          <span className={`pill ${statusColors[proposal.status]}`}>{proposal.status}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ color: 'var(--muted)', fontSize: 14, whiteSpace: 'pre-wrap' }}>{proposal.coverLetter}</div>
                    <div className="hint" style={{ fontSize: 12 }}>Estimated duration: {proposal.estimatedDuration} days</div>

                    {proposal.attachments && proposal.attachments.length > 0 && (
                      <div className="proposal-attachments">
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📎 Tệp đính kèm ({proposal.attachments.length})</div>
                        <div className="proposal-attachment-list">
                          {proposal.attachments.map((attachment) => (
                            <div key={attachment.attachmentId} className="proposal-attachment-item">
                              <div className="proposal-attachment-info">
                                <div style={{ fontSize: 13 }}>{attachment.fileName}</div>
                                <div className="hint" style={{ fontSize: 11 }}>{attachment.mimeType} · {(attachment.fileSize / 1024).toFixed(1)} KB</div>
                              </div>
                              <button
                                className="btn btn-outline"
                                onClick={() => handleDownloadAttachment(proposal.id, attachment)}
                              >
                                Tải file
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {proposal.status === 'PENDING' && (
                      <div className="proposal-actions">
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
                      <div className="proposal-actions">
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
