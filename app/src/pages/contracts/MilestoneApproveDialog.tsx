import { useState } from 'react'
import { approveMilestone } from '../../api/contractApi'
import type { MilestoneResponse } from '../../types/contract'
import './MilestoneApproveDialog.css'

interface MilestoneApproveDialogProps {
  milestone: MilestoneResponse
  isOpen: boolean
  onClose: () => void
  onApproveSuccess: () => void
}

export function MilestoneApproveDialog({
  milestone,
  isOpen,
  onClose,
  onApproveSuccess,
}: MilestoneApproveDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleApprove = async () => {
    setError(null)

    try {
      setLoading(true)
      await approveMilestone(milestone.id)
      onApproveSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="approve-dialog-overlay" onClick={onClose}>
      <div className="approve-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Approve Milestone</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <div className="dialog-content">
          {error && <div className="error-message">{error}</div>}

          <div className="milestone-summary">
            <h3>{milestone.title}</h3>
            <p className="description">{milestone.description}</p>

            <div className="summary-grid">
              <div className="summary-item">
                <label>Amount:</label>
                <span className="amount">${milestone.amount.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <label>Due Date:</label>
                <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <label>Status:</label>
                <span className="status" data-status={milestone.status}>
                  {milestone.status}
                </span>
              </div>
              <div className="summary-item">
                <label>Revisions:</label>
                <span>
                  {milestone.revisionCount} / {milestone.maxRevisions}
                </span>
              </div>
            </div>

            <div className="confirmation-box">
              <h4>Approval Confirmation</h4>
              <p>By approving this milestone, you confirm that:</p>
              <ul>
                <li>The deliverable meets the project requirements</li>
                <li>${milestone.amount.toFixed(2)} will be released to the freelancer</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="dialog-actions">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-approve"
            onClick={handleApprove}
            disabled={loading}
          >
            {loading ? 'Approving...' : 'Approve & Release Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}
