import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitMilestone } from '../../api/contractApi'
import type { MilestoneSubmitRequest } from '../../types/contract'
import './MilestoneSubmitForm.css'

export function MilestoneSubmitForm() {
  const { contractId, milestoneId } = useParams<{ contractId: string; milestoneId: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<MilestoneSubmitRequest>({
    fileUrl: '',
    linkUrl: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!milestoneId) {
      setError('Milestone ID not found')
      return
    }

    if (!formData.fileUrl && !formData.linkUrl) {
      setError('Please provide either a file URL or a link')
      return
    }

    try {
      setLoading(true)
      await submitMilestone(milestoneId, formData)
      navigate(`/contracts/${contractId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="milestone-submit-form-container">
      <div className="form-header">
        <h2>Submit Deliverable</h2>
        <p>Provide your work deliverable for this milestone</p>
      </div>

      <form onSubmit={handleSubmit} className="milestone-submit-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="fileUrl">File URL</label>
          <input
            type="url"
            id="fileUrl"
            name="fileUrl"
            placeholder="https://example.com/file.zip"
            value={formData.fileUrl || ''}
            onChange={handleInputChange}
          />
          <small>Direct link to your deliverable file</small>
        </div>

        <div className="form-group">
          <label htmlFor="linkUrl">Project Link</label>
          <input
            type="url"
            id="linkUrl"
            name="linkUrl"
            placeholder="https://github.com/username/project"
            value={formData.linkUrl || ''}
            onChange={handleInputChange}
          />
          <small>Link to project repository or live preview</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe what you've delivered and any important notes..."
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={6}
          />
          <small>Provide details about your deliverable</small>
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
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Deliverable'}
          </button>
        </div>
      </form>
    </div>
  )
}
