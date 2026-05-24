import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getContractMilestones } from '../../api/contractApi'
import { useAuth } from '../../auth/AuthContext'
import { MilestoneApproveDialog } from './MilestoneApproveDialog'
import type { MilestoneResponse } from '../../types/contract'
import './MilestoneDetailPage.css'

export function MilestoneDetailPage() {
  const { contractId, milestoneId } = useParams<{ contractId: string; milestoneId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [milestone, setMilestone] = useState<MilestoneResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

  useEffect(() => {
    if (!contractId) {
      setError('Contract ID not found')
      return
    }

    const fetchMilestones = async () => {
      try {
        setLoading(true)
        const milestones = await getContractMilestones(contractId)
        const found = milestones.find((m) => m.id === milestoneId)
        if (found) {
          setMilestone(found)
        } else {
          setError('Milestone not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load milestone')
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [contractId, milestoneId])

  if (loading) {
    return <div className="milestone-detail loading">Loading...</div>
  }

  if (error || !milestone) {
    return <div className="milestone-detail error">Error: {error || 'Milestone not found'}</div>
  }

  const isFreelancer = user?.role === 'FREELANCER'
  const isEmployer = user?.role === 'EMPLOYER'

  const canSubmit = isFreelancer && milestone.status === 'IN_PROGRESS'
  const canRequestRevision = isEmployer && milestone.status === 'SUBMITTED'
  const canApprove = isEmployer && milestone.status === 'SUBMITTED'

  return (
    <div className="milestone-detail">
      <button className="back-button" onClick={() => navigate(`/contracts/${contractId}`)}>
        ← Back to Contract
      </button>

      <div className="milestone-content">
        <div className="milestone-header">
          <div>
            <h1>{milestone.title}</h1>
            <p className="description">{milestone.description}</p>
          </div>
          <div className={`status-badge status-${milestone.status.toLowerCase()}`}>
            {milestone.status}
          </div>
        </div>

        <div className="milestone-info-grid">
          <div className="info-card">
            <label>Amount</label>
            <div className="amount">${milestone.amount.toFixed(2)}</div>
          </div>
          <div className="info-card">
            <label>Due Date</label>
            <div>{new Date(milestone.dueDate).toLocaleDateString()}</div>
          </div>
          <div className="info-card">
            <label>Status</label>
            <div>{milestone.status}</div>
          </div>
          <div className="info-card">
            <label>Revisions</label>
            <div>
              {milestone.revisionCount} / {milestone.maxRevisions}
            </div>
          </div>
        </div>

        <div className="milestone-actions">
          {canSubmit && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/contracts/${contractId}/milestones/${milestoneId}/submit`)}
            >
              Submit Deliverable
            </button>
          )}
          {canRequestRevision && (
            <button
              className="btn btn-warning"
              onClick={() => navigate(`/contracts/${contractId}/milestones/${milestoneId}/revision`)}
            >
              Request Revision
            </button>
          )}
          {canApprove && (
            <button
              className="btn btn-success"
              onClick={() => setIsApproveDialogOpen(true)}
            >
              Approve & Release Payment
            </button>
          )}
        </div>
      </div>

      <MilestoneApproveDialog
        milestone={milestone}
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onApproveSuccess={() => {
          // Refresh milestone data
          window.location.reload()
        }}
      />
    </div>
  )
}
