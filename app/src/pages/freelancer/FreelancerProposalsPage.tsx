import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import * as proposalApi from '../../api/proposalApi'
import type { ProposalAttachmentResponse, ProposalResponse, ProposalStatus } from '../../types/proposal'

const statusColors: Record<ProposalStatus, string> = {
  PENDING: 'pill-primary',
  SHORTLISTED: 'pill-success',
  REJECTED: 'pill-error',
  WITHDRAWN: 'pill-muted',
}

const statusLabels: Record<ProposalStatus, string> = {
  PENDING: 'Pending',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

export function FreelancerProposalsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0 })

  const PAGE_SIZE = 10

  useEffect(() => {
    if (user?.role !== 'FREELANCER') {
      setError('You must be a freelancer to view this page')
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        const status = selectedStatus === 'ALL' ? undefined : selectedStatus
        const res = await proposalApi.getFreelancerProposals(status, page, PAGE_SIZE)
        if (!cancelled) {
          setProposals(res.items)
          setPageInfo({ totalElements: res.totalElements, totalPages: res.totalPages })
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load proposals')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, selectedStatus, page])

  const handleWithdraw = async (proposalId: string) => {
    if (!confirm('Are you sure you want to withdraw this proposal?')) return

    try {
      await proposalApi.withdrawProposal(proposalId)
      // Refresh proposals
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus
      const res = await proposalApi.getFreelancerProposals(status, page, PAGE_SIZE)
      setProposals(res.items)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to withdraw proposal')
    }
  }

  const handleDownloadAttachment = async (proposalId: string, attachment: ProposalAttachmentResponse) => {
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
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to download attachment')
    }
  }

  if (loading) return <div className="hint">Loading proposals…</div>

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="page-title">My Proposals</h1>
        <p className="page-subtitle">Track your job proposals and their status</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="row" style={{ gap: 8 }}>
        {(['ALL', 'PENDING', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'] as const).map((status) => (
          <button
            key={status}
            className={`btn ${selectedStatus === status ? 'btn-primary' : ''}`}
            onClick={() => {
              setSelectedStatus(status)
              setPage(0)
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {proposals.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          No proposals found
        </div>
      ) : (
        <>
          <div className="stack" style={{ gap: 8 }}>
            {proposals.map((proposal) => (
              <div key={proposal.id} className="card card-pad stack" style={{ gap: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stack" style={{ gap: 4, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{proposal.jobTitle}</div>
                    <div className="row" style={{ gap: 8 }}>
                      <span className={`pill ${statusColors[proposal.status]}`}>{statusLabels[proposal.status]}</span>
                      <span className="hint">Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                <div style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap', fontSize: 14 }}>{proposal.coverLetter}</div>

                {proposal.attachments?.length > 0 && (
                  <div className="stack" style={{ gap: 8 }}>
                    <div className="hint" style={{ fontSize: 12, fontWeight: 600 }}>Attachments</div>
                    <div className="stack" style={{ gap: 6 }}>
                      {proposal.attachments.map((attachment) => (
                        <div key={attachment.attachmentId} className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div className="stack" style={{ gap: 2 }}>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{attachment.fileName}</div>
                            <div className="hint" style={{ fontSize: 12 }}>{attachment.mimeType} · {(attachment.fileSize / 1024).toFixed(1)} KB</div>
                          </div>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDownloadAttachment(proposal.id, attachment)}
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hint" style={{ fontSize: 12 }}>
                  Estimated duration: {proposal.estimatedDuration} days
                </div>

                {proposal.status === 'PENDING' && (
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleWithdraw(proposal.id)}
                      style={{ color: 'var(--error)' }}
                    >
                      Withdraw
                    </button>
                  </div>
                )}

                {proposal.respondedAt && (
                  <div className="hint" style={{ fontSize: 12 }}>
                    Responded: {new Date(proposal.respondedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pageInfo.totalPages > 1 && (
            <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
              <button
                className="btn"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              <span className="hint" style={{ alignSelf: 'center' }}>
                Page {page + 1} of {pageInfo.totalPages}
              </span>
              <button
                className="btn"
                onClick={() => setPage(Math.min(pageInfo.totalPages - 1, page + 1))}
                disabled={page === pageInfo.totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
