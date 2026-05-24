import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { requestRevision } from '../../api/contractApi'
import type { RevisionRequest } from '../../types/contract'
import './RevisionRequestForm.css'

interface RevisionFormProps {
  maxRevisions?: number
  currentRevisions?: number
}

export function RevisionRequestForm({ maxRevisions = 3, currentRevisions = 0 }: RevisionFormProps) {
  const { contractId, milestoneId } = useParams<{ contractId: string; milestoneId: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RevisionRequest>({
    revisionDesc: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remainingRevisions = maxRevisions - currentRevisions
  const canRequestRevision = remainingRevisions > 0

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      revisionDesc: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!milestoneId) {
      setError('Milestone ID not found')
      return
    }

    if (!formData.revisionDesc.trim()) {
      setError('Please provide revision details')
      return
    }

    if (!canRequestRevision) {
      setError('Maximum revisions reached')
      return
    }

    try {
      setLoading(true)
      await requestRevision(milestoneId, formData)
      navigate(`/contracts/${contractId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request revision')
    } finally {
      setLoading(false)
    }
  }

  if (!canRequestRevision) {
    return (
      <div className="revision-request-form-container">
        <div className="max-revisions-reached">
          <h3>Maximum Revisions Reached</h3>
          <p>You have reached the maximum number of revisions ({maxRevisions}) for this milestone.</p>
          <button
            className="btn-back"
            onClick={() => navigate(`/contracts/${contractId}`)}
          >
            Back to Contract
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="revision-request-form-container">
      <div className="form-header">
        <h2>Request Revision</h2>
        <p>Describe what needs to be revised or improved</p>
      </div>

      <div className="revision-counter">
        <span className="counter-label">Revisions used:</span>
        <span className="counter-value">
          {currentRevisions} / {maxRevisions}
        </span>
        {remainingRevisions > 0 && (
          <span className="remaining-info">({remainingRevisions} remaining)</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="revision-request-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="revisionDesc">Revision Details</label>
          <textarea
            id="revisionDesc"
            name="revisionDesc"
            placeholder="Explain what needs to be revised or improved. Be specific about the changes required..."
            value={formData.revisionDesc}
            onChange={handleInputChange}
            rows={8}
          />
          <small>
            Be clear and specific about the revision requirements to ensure the freelancer understands your feedback
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate(`/contracts/${contractId}`)}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-request" disabled={loading || !canRequestRevision}>
            {loading ? 'Requesting...' : 'Request Revision'}
          </button>
        </div>
      </form>
    </div>
  )
}
