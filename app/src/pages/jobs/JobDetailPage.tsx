import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import * as proposalApi from '../../api/proposalApi'
import { useAuth } from '../../auth/AuthContext'
import type { JobDetail } from '../../types/job'
import type { ProposalAttachmentResponse, ProposalResponse, SubmitProposalRequest } from '../../types/proposal'

/* ─── helpers (same as JobListPage) ─── */
function formatDeadline(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0)  return 'Đã hết hạn'
  if (diff === 0) return 'Hôm nay'
  if (diff === 1) return 'Còn 1 ngày'
  if (diff <= 7)  return `Còn ${diff} ngày`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRelative(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1)  return 'Vừa đăng'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `${diffH} giờ trước`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30)   return `${diffD} ngày trước`
  return d.toLocaleDateString('vi-VN')
}

function formatBudget(job: JobDetail): string {
  if (job.budgetType === 'FIXED') {
    return job.fixedBudget != null ? `$${Number(job.fixedBudget).toLocaleString()}` : '—'
  }
  if (job.hourlyRate != null) {
    return job.estimatedHours != null
      ? `$${Number(job.hourlyRate).toLocaleString()}/h · ~${job.estimatedHours}h`
      : `$${Number(job.hourlyRate).toLocaleString()}/h`
  }
  return '—'
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  OPEN:        { bg: '#dcfce7', color: '#15803d', label: 'Đang mở' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#1d4ed8', label: 'Đang làm' },
  COMPLETED:   { bg: '#f3f4f6', color: '#4b5563', label: 'Hoàn thành' },
  CANCELLED:   { bg: '#fee2e2', color: '#b91c1c', label: 'Đã hủy' },
}

/* ─── Skeleton loader ─── */
function SkeletonDetail() {
  return (
    <>
      <style>{skeletonCss}</style>
      <div className="jd-root">
        <div className="jd-skeleton-header">
          <div className="jd-skel" style={{ height: 14, width: 80, borderRadius: 99 }} />
          <div className="jd-skel" style={{ height: 28, width: '55%', marginTop: 12 }} />
          <div className="jd-skel" style={{ height: 14, width: '35%', marginTop: 8 }} />
        </div>
        <div className="jd-body">
          <div className="jd-main">
            <div className="jd-skel" style={{ height: 120, borderRadius: 14 }} />
            <div className="jd-skel" style={{ height: 180, borderRadius: 14, marginTop: 12 }} />
          </div>
          <div className="jd-sidebar">
            <div className="jd-skel" style={{ height: 260, borderRadius: 14 }} />
          </div>
        </div>
      </div>
    </>
  )
}

const skeletonCss = `
  .jd-skel {
    background: linear-gradient(90deg,var(--border,#e5e7eb) 25%,#f3f4f6 50%,var(--border,#e5e7eb) 75%);
    background-size: 200% 100%;
    animation: jd-shimmer 1.4s infinite;
  }
  @keyframes jd-shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
`

/* ═══════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export function JobDetailPage() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading]                       = useState(true)
  const [error, setError]                           = useState<string | null>(null)
  const [job, setJob]                               = useState<JobDetail | null>(null)
  const [showModal, setShowModal]                   = useState(false)
  const [coverLetter, setCoverLetter]               = useState('')
  const [estimatedDuration, setEstimatedDuration]   = useState('')
  const [selectedFiles, setSelectedFiles]           = useState<File[]>([])
  const [proposalLoading, setProposalLoading]       = useState(false)
  const [proposalError, setProposalError]           = useState<string | null>(null)
  const [proposalSuccess, setProposalSuccess]       = useState(false)
  const [jobProposals, setJobProposals]             = useState<ProposalResponse[]>([])
  const [jobProposalsLoading, setJobProposalsLoading] = useState(false)
  const [jobProposalsError, setJobProposalsError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!jobId) return
        const res = await jobApi.getJob(jobId)
        if (!cancelled) setJob(res)
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải công việc')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [jobId])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!jobId || !job || user?.role !== 'EMPLOYER' || user.id !== job.employerId) {
        console.log('Not employer owner, skipping proposal load')
        setJobProposals([])
        setJobProposalsError(null)
        setJobProposalsLoading(false)
        return
      }

      try {
        console.log('Loading proposals for jobId:', jobId)
        setJobProposalsLoading(true)
        setJobProposalsError(null)
        const res = await proposalApi.getJobProposals(jobId)
        console.log('Proposals loaded:', res.items)
        console.log('Proposal attachments:', res.items.map(p => ({ id: p.id, attachmentsCount: p.attachments?.length || 0, attachments: p.attachments })))
        if (!cancelled) {
          setJobProposals(res.items)
        }
      } catch (err: any) {
        console.error('Error loading proposals:', err)
        if (!cancelled) {
          setJobProposalsError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải proposal')
        }
      } finally {
        if (!cancelled) setJobProposalsLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [jobId, job, user?.role, user?.id])

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setProposalError(null)
    setProposalLoading(true)
    try {
      if (!jobId) return
      const req: SubmitProposalRequest = {
        coverLetter,
        estimatedDuration: Number(estimatedDuration),
      }
      await proposalApi.submitProposal(jobId, req, selectedFiles)
      setProposalSuccess(true)
      setCoverLetter('')
      setEstimatedDuration('')
      setSelectedFiles([])
      const updatedJob = await jobApi.getJob(jobId)
      setJob(updatedJob)
      setTimeout(() => { setShowModal(false); setProposalSuccess(false) }, 1400)
    } catch (err: any) {
      setProposalError(err?.response?.data?.message ?? err?.message ?? 'Không thể gửi đề xuất')
    } finally {
      setProposalLoading(false)
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
      setProposalError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải file đính kèm')
    }
  }

  if (loading) return <SkeletonDetail />
  if (error) {
    return (
      <div className="jd-root">
        <style>{css}</style>
        <div className="jd-error-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      </div>
    )
  }
  if (!job) return null

  const ss        = STATUS_STYLE[job.status] ?? STATUS_STYLE.OPEN
  const deadline  = formatDeadline((job as any).deadline)
  const urgentDl  = deadline.startsWith('Còn') && parseInt(deadline.replace('Còn ', '')) <= 3
  const canSubmit = user?.role === 'FREELANCER' && job.status === 'OPEN'
  const isEmployerOwner = user?.role === 'EMPLOYER' && user.id === job.employerId
  const charLeft  = 500 - coverLetter.length

  // Debug
  if (typeof window !== 'undefined') {
    (window as any).DEBUG_JOB = { isEmployerOwner, userRole: user?.role, userId: user?.id, jobEmployerId: job.employerId, jobProposals }
  }

  return (
    <>
      <style>{css}</style>

      <div className="jd-root">

        {/* ── Breadcrumb ── */}
        <nav className="jd-breadcrumb">
          <Link to="/jobs" className="jd-breadcrumb-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Danh sách việc làm
          </Link>
          <span className="jd-breadcrumb-sep">/</span>
          <span className="jd-breadcrumb-current">Chi tiết công việc</span>
        </nav>

        {/* ── Hero header ── */}
        <div className="jd-header">
          <div className="jd-header-meta">
            <span className="jd-status-badge" style={{ background: ss.bg, color: ss.color }}>
              {ss.label}
            </span>
            <span className="jd-header-time">{formatRelative((job as any).createdAt)}</span>
          </div>

          <h1 className="jd-title">{job.title}</h1>

          {job.requiredSkills?.length > 0 && (
            <div className="jd-skill-pills">
              {job.requiredSkills.map(sk => (
                <span key={sk} className="jd-skill-pill">{sk}</span>
              ))}
            </div>
          )}

          {canSubmit && (
            <div className="jd-header-actions">
              <button className="jd-btn-primary" onClick={() => setShowModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                Gửi đề xuất
              </button>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="jd-body">

          {/* ── Left: Description ── */}
          <div className="jd-main">

            {/* Stats grid */}
            <div className="jd-stats-grid">
              <div className="jd-stat">
                <span className="jd-stat-label">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline',verticalAlign:'middle',marginRight:4 }}>
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Ngân sách
                </span>
                <span className="jd-stat-value">{formatBudget(job)}</span>
              </div>
              <div className="jd-stat">
                <span className="jd-stat-label">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline',verticalAlign:'middle',marginRight:4 }}>
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                  Hình thức
                </span>
                <span className="jd-stat-value">{job.budgetType === 'FIXED' ? 'Cố định' : 'Theo giờ'}</span>
              </div>
              <div className="jd-stat">
                <span className="jd-stat-label">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline',verticalAlign:'middle',marginRight:4 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Deadline
                </span>
                <span className="jd-stat-value" style={urgentDl ? { color: '#dc2626' } : undefined}>
                  {deadline}
                </span>
              </div>
              <div className="jd-stat">
                <span className="jd-stat-label">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline',verticalAlign:'middle',marginRight:4 }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Đề xuất
                </span>
                <span className="jd-stat-value">{(job as any).proposalCount ?? 0} người</span>
              </div>
            </div>

            {/* Description */}
            <div className="jd-card">
              <div className="jd-card-heading">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
                </svg>
                Mô tả công việc
              </div>
              <div className="jd-description">
                {job.description || <span style={{ color: 'var(--text-muted,#9ca3af)', fontStyle: 'italic' }}>Chưa có mô tả.</span>}
              </div>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <aside className="jd-sidebar">

            {/* Quick info card */}
            <div className="jd-card">
              <div className="jd-card-heading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Thông tin chi tiết
              </div>

              <div className="jd-info-list">
                <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>} label="Trạng thái">
                  <span className="jd-status-badge" style={{ background: ss.bg, color: ss.color, fontSize: 11 }}>
                    {ss.label}
                  </span>
                </InfoRow>
                <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label="Nhà tuyển dụng">
                  <span className="jd-info-value">{(job as any).employerName ?? job.employerId}</span>
                </InfoRow>
                <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Ngân sách">
                  <span className="jd-info-value">{formatBudget(job)}</span>
                </InfoRow>
                <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>} label="Hình thức">
                  <span className="jd-info-value">{job.budgetType === 'FIXED' ? 'Cố định' : 'Theo giờ'}</span>
                </InfoRow>
                {job.estimatedHours != null && (
                  <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>} label="Số giờ ước tính">
                    <span className="jd-info-value">{job.estimatedHours}h</span>
                  </InfoRow>
                )}
                <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} label="Deadline">
                  <span className="jd-info-value" style={urgentDl ? { color: '#dc2626', fontWeight: 700 } : undefined}>
                    {deadline}
                  </span>
                </InfoRow>
                <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>} label="Đăng lúc">
                  <span className="jd-info-value">{(job as any).createdAt?.slice(0, 10) ?? '—'}</span>
                </InfoRow>
                <InfoRow icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} label="Số đề xuất">
                  <span className="jd-info-value">{(job as any).proposalCount ?? 0} người</span>
                </InfoRow>
              </div>

              {canSubmit && (
                <button className="jd-btn-primary jd-btn-full" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Gửi đề xuất ngay
                </button>
              )}
            </div>

            {/* Skills card */}
            {job.requiredSkills?.length > 0 && (
              <div className="jd-card">
                <div className="jd-card-heading">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                  Kỹ năng yêu cầu
                </div>
                <div className="jd-skill-tags">
                  {job.requiredSkills.map(sk => (
                    <span key={sk} className="jd-skill-tag">{sk}</span>
                  ))}
                </div>
              </div>
            )}

            {isEmployerOwner && (
              <div className="jd-card">
                <div className="jd-card-heading">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Proposal của freelancer
                </div>

                {jobProposalsLoading ? (
                  <div className="hint">Đang tải proposal…</div>
                ) : jobProposalsError ? (
                  <div className="jd-error-box" style={{ marginTop: 12 }}>{jobProposalsError}</div>
                ) : jobProposals.length === 0 ? (
                  <div className="hint">Chưa có proposal nào.</div>
                ) : (
                  <div className="stack" style={{ gap: 10 }}>
                    {jobProposals.map((proposal) => (
                      <div key={proposal.id} className="card" style={{ padding: 12, border: '1px solid var(--border,#e5e7eb)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{proposal.freelancerId}</div>
                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted,#6b7280)', fontSize: 13, marginBottom: 8 }}>
                          {proposal.coverLetter}
                        </div>
                        <div className="hint" style={{ fontSize: 12, marginBottom: 8 }}>
                          {proposal.estimatedDuration} ngày · {proposal.status}
                        </div>
                        {proposal.attachments && proposal.attachments.length > 0 && (
                          <div className="stack" style={{ gap: 8, marginTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted,#6b7280)' }}>
                              📎 Tệp đính kèm ({proposal.attachments.length})
                            </div>
                            <div className="stack" style={{ gap: 6 }}>
                              {proposal.attachments.map((attachment) => (
                                <div key={attachment.attachmentId} className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: 'var(--bg-muted,#f9fafb)', borderRadius: 6 }}>
                                  <div className="stack" style={{ gap: 2 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>{attachment.fileName}</div>
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* ═══ PROPOSAL MODAL ═══ */}
      {showModal && (
        <div className="jd-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="jd-modal">

            {/* Modal header */}
            <div className="jd-modal-header">
              <div>
                <div className="jd-modal-title">Gửi đề xuất</div>
                <div className="jd-modal-subtitle">{job.title}</div>
              </div>
              <button className="jd-modal-close" onClick={() => { setShowModal(false); setProposalError(null) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="jd-modal-divider" />

            {proposalSuccess ? (
              <div className="jd-modal-success">
                <div className="jd-success-icon">✓</div>
                <div className="jd-success-text">Đề xuất đã được gửi thành công!</div>
              </div>
            ) : (
              <form className="jd-modal-form" onSubmit={handleSubmitProposal}>

                <div className="jd-field">
                  <label className="jd-label">
                    Thư giới thiệu
                    <span className="jd-char-count" style={{ color: charLeft < 50 ? '#ef4444' : undefined }}>
                      {charLeft} ký tự còn lại
                    </span>
                  </label>
                  <textarea
                    className="jd-textarea"
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Giới thiệu bản thân và lý do bạn phù hợp với công việc này…"
                    minLength={10}
                    maxLength={500}
                    required
                    rows={5}
                  />
                  <div className="jd-field-hint">Tối thiểu 10, tối đa 500 ký tự</div>
                </div>

                <div className="jd-field">
                  <label className="jd-label">Thời gian hoàn thành dự kiến (ngày)</label>
                  <input
                    className="jd-input"
                    type="number"
                    min="1"
                    value={estimatedDuration}
                    onChange={e => setEstimatedDuration(e.target.value)}
                    placeholder="Ví dụ: 14"
                    required
                  />
                </div>

                <div className="jd-field">
                  <label className="jd-label">File minh chứng</label>
                  <input
                    className="jd-input"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={e => setSelectedFiles(Array.from(e.target.files ?? []))}
                  />
                  <div className="jd-field-hint">Ảnh, PDF, DOC, DOCX · tối đa 20MB mỗi file</div>
                  {selectedFiles.length > 0 && (
                    <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                      {selectedFiles.map(file => (
                        <div key={file.name + file.lastModified} className="hint" style={{ fontSize: 12 }}>
                          • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {proposalError && (
                  <div className="jd-error-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {proposalError}
                  </div>
                )}

                <div className="jd-modal-actions">
                  <button
                    type="button"
                    className="jd-btn-ghost"
                    onClick={() => { setShowModal(false); setProposalError(null) }}
                    disabled={proposalLoading}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="jd-btn-primary" disabled={proposalLoading}>
                    {proposalLoading
                      ? <><span className="jd-spinner" />Đang gửi…</>
                      : <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                          </svg>
                          Gửi đề xuất
                        </>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ── Small helper component ── */
function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="jd-info-row">
      <span className="jd-info-icon">{icon}</span>
      <span className="jd-info-label">{label}</span>
      <span className="jd-info-val">{children}</span>
    </div>
  )
}

/* ════════════════════════════════════════════
   CSS — same design tokens as JobListPage
════════════════════════════════════════════ */
const css = `
  ${skeletonCss}

  .jd-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 56px;
  }

  /* ── Breadcrumb ── */
  .jd-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 20px 0 0;
    font-size: 12.5px;
    color: var(--text-muted, #9ca3af);
  }
  .jd-breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--color-primary, #2563eb);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .jd-breadcrumb-link:hover { opacity: 0.75; }
  .jd-breadcrumb-sep { color: var(--border, #d1d5db); }
  .jd-breadcrumb-current { color: var(--text-muted, #9ca3af); }

  /* ── Header ── */
  .jd-header {
    padding: 24px 0 22px;
    border-bottom: 1px solid var(--border, #e5e7eb);
    margin-bottom: 24px;
  }
  .jd-header-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .jd-status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .jd-header-time {
    font-size: 12px;
    color: var(--text-muted, #9ca3af);
  }
  .jd-title {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.25;
    color: var(--text, #111827);
    margin: 0 0 14px;
  }
  .jd-skill-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 18px; }
  .jd-skill-pill {
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 500;
    background: var(--bg-subtle, #f3f4f6);
    border: 1px solid var(--border, #e5e7eb);
    color: var(--text-muted, #6b7280);
  }
  .jd-header-actions { display: flex; gap: 8px; }

  /* ── Buttons ── */
  .jd-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 11px 20px;
    border-radius: 10px;
    border: none;
    background: var(--color-primary, #2563eb);
    color: #fff;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s;
    white-space: nowrap;
  }
  .jd-btn-primary:hover:not(:disabled) { background: var(--color-primary-hover, #1d4ed8); }
  .jd-btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .jd-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
  .jd-btn-full { width: 100%; justify-content: center; }

  .jd-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 11px 20px;
    border-radius: 10px;
    border: 1.5px solid var(--border, #e5e7eb);
    background: none;
    color: var(--text, #374151);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .jd-btn-ghost:hover:not(:disabled) { background: var(--bg-subtle, #f9fafb); border-color: #d1d5db; }
  .jd-btn-ghost:disabled { opacity: 0.55; cursor: not-allowed; }

  /* ── Body layout ── */
  .jd-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 768px) {
    .jd-body { grid-template-columns: 1fr; }
    .jd-sidebar { order: -1; }
  }

  /* ── Stats grid (same style as card stats in list) ── */
  .jd-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border, #e5e7eb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  @media (max-width: 640px) {
    .jd-stats-grid { grid-template-columns: 1fr 1fr; }
  }
  .jd-stat {
    background: var(--bg-subtle, #f9fafb);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .jd-stat-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #9ca3af);
  }
  .jd-stat-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text, #111827);
  }

  /* ── Cards ── */
  .jd-card {
    background: var(--bg-card, #fff);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 14px;
  }
  .jd-card:last-child { margin-bottom: 0; }
  .jd-card-heading {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text, #111827);
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  /* ── Description ── */
  .jd-description {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text, #374151);
    white-space: pre-wrap;
  }

  /* ── Sidebar Info list ── */
  .jd-info-list { display: flex; flex-direction: column; gap: 0; }
  .jd-info-row {
    display: grid;
    grid-template-columns: 22px 1fr auto;
    gap: 6px;
    align-items: center;
    padding: 9px 0;
    border-bottom: 1px solid var(--border, #f3f4f6);
    font-size: 12.5px;
  }
  .jd-info-row:last-child { border-bottom: none; }
  .jd-info-icon { display: flex; align-items: center; color: var(--text-muted, #9ca3af); }
  .jd-info-label { color: var(--text-muted, #6b7280); font-weight: 500; }
  .jd-info-value { font-weight: 600; color: var(--text, #111827); text-align: right; }

  /* ── Sidebar Skills ── */
  .jd-skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .jd-skill-tag {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 500;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  /* ── Error box ── */
  .jd-error-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 10px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    font-size: 13px;
    margin-bottom: 8px;
  }

  /* ── Modal overlay ── */
  .jd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    backdrop-filter: blur(2px);
    animation: jd-fade-in 0.18s ease;
  }
  @keyframes jd-fade-in { from { opacity: 0 } to { opacity: 1 } }

  .jd-modal {
    background: var(--bg-card, #fff);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 18px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    animation: jd-slide-up 0.22s cubic-bezier(0.16,1,0.3,1);
    overflow: hidden;
  }
  @keyframes jd-slide-up { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }

  .jd-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px 20px 18px;
  }
  .jd-modal-title {
    font-size: 17px;
    font-weight: 800;
    color: var(--text, #111827);
    letter-spacing: -0.3px;
  }
  .jd-modal-subtitle {
    font-size: 12px;
    color: var(--text-muted, #9ca3af);
    margin-top: 3px;
    max-width: 340px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jd-modal-close {
    background: var(--bg-subtle, #f3f4f6);
    border: none;
    border-radius: 8px;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--text-muted, #6b7280);
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }
  .jd-modal-close:hover { background: #fee2e2; color: #b91c1c; }

  .jd-modal-divider { height: 1px; background: var(--border, #e5e7eb); }

  .jd-modal-form {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Form fields ── */
  .jd-field { display: flex; flex-direction: column; gap: 7px; }
  .jd-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted, #6b7280);
  }
  .jd-char-count { font-size: 11px; font-weight: 500; color: var(--text-muted, #9ca3af); text-transform: none; letter-spacing: 0; }
  .jd-field-hint { font-size: 11.5px; color: var(--text-muted, #9ca3af); }

  .jd-textarea, .jd-input {
    padding: 11px 14px;
    border-radius: 10px;
    border: 1.5px solid var(--border, #e5e7eb);
    background: var(--bg-subtle, #f9fafb);
    font-size: 13.5px;
    color: var(--text, #111827);
    outline: none;
    resize: vertical;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }
  .jd-textarea:focus, .jd-input:focus {
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .jd-modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 4px;
  }

  /* ── Success state ── */
  .jd-modal-success {
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }
  .jd-success-icon {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: #dcfce7;
    color: #15803d;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    animation: jd-pop 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes jd-pop { from { transform: scale(0.6); opacity: 0 } to { transform: scale(1); opacity: 1 } }
  .jd-success-text {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text, #111827);
  }

  /* ── Spinner ── */
  .jd-spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: jd-spin 0.65s linear infinite;
    display: inline-block;
  }
  @keyframes jd-spin { to { transform: rotate(360deg) } }
`