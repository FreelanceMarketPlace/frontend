import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getContractDetail, getContractMilestones } from '../../api/contractApi'
import type { ContractResponse, MilestoneResponse } from '../../types/contract'
import './ContractDashboard.css'

export function ContractDashboard() {
  const { contractId } = useParams<{ contractId: string }>()
  const navigate = useNavigate()
  const [contract, setContract] = useState<ContractResponse | null>(null)
  const [milestones, setMilestones] = useState<MilestoneResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contractId) {
      setError('Contract ID not found')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const contractData = await getContractDetail(contractId)
        setContract(contractData)

        const milestonesData = await getContractMilestones(contractId)
        setMilestones(milestonesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contract')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [contractId])

  if (loading) {
    return <div className="contract-dashboard loading">Loading...</div>
  }

  if (error) {
    return <div className="contract-dashboard error">Error: {error}</div>
  }

  if (!contract) {
    return <div className="contract-dashboard error">Contract not found</div>
  }

  const handleMilestoneClick = (milestoneId: string) => {
    navigate(`/contracts/${contractId}/milestones/${milestoneId}`)
  }

  return (
    <div className="contract-dashboard">
      <div className="contract-header">
        <h1>Contract Details</h1>
        <div className="contract-status-badge" data-status={contract.status}>
          {contract.status}
        </div>
      </div>

      <div className="contract-info">
        <div className="info-grid">
          <div className="info-item">
            <label>Contract ID:</label>
            <span>{contract.id}</span>
          </div>
          <div className="info-item">
            <label>Job ID:</label>
            <span>{contract.jobId}</span>
          </div>
          <div className="info-item">
            <label>Total Value:</label>
            <span>${contract.totalValue.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span>{contract.status}</span>
          </div>
          <div className="info-item">
            <label>Start Date:</label>
            <span>{new Date(contract.startDate).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>End Date:</label>
            <span>{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="milestones-section">
        <h2>Milestones</h2>
        {milestones.length === 0 ? (
          <p className="no-data">No milestones found</p>
        ) : (
          <div className="milestones-list">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="milestone-card"
                onClick={() => handleMilestoneClick(milestone.id)}
              >
                <div className="milestone-header">
                  <h3>{milestone.title}</h3>
                  <div className="milestone-status-badge" data-status={milestone.status}>
                    {milestone.status}
                  </div>
                </div>
                <p className="milestone-description">{milestone.description}</p>
                <div className="milestone-meta">
                  <span className="amount">${milestone.amount.toFixed(2)}</span>
                  <span className="due-date">Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                  <span className="revisions">
                    Revisions: {milestone.revisionCount}/{milestone.maxRevisions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
