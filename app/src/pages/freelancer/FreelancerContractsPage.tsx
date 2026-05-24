import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFreelancerContracts } from '../../api/contractApi'
import { useAuth } from '../../auth/AuthContext'
import type { ContractResponse } from '../../types/contract'
import './FreelancerContractsPage.css'

export function FreelancerContractsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contracts, setContracts] = useState<ContractResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const fetchContracts = async () => {
      try {
        setLoading(true)
        const data = await getFreelancerContracts(user.id)
        setContracts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contracts')
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [user?.id])

  if (loading) {
    return <div className="freelancer-contracts loading">Loading contracts...</div>
  }

  if (error) {
    return <div className="freelancer-contracts error">Error: {error}</div>
  }

  return (
    <div className="freelancer-contracts">
      <div className="page-header">
        <h1>My Contracts</h1>
        <p className="subtitle">Track and manage your ongoing and completed contracts</p>
      </div>

      {contracts.length === 0 ? (
        <div className="empty-state">
          <h2>No Contracts Yet</h2>
          <p>Accept offers to create contracts and start working on projects</p>
          <button className="btn btn-primary" onClick={() => navigate('/freelancer/offers')}>
            View Offers
          </button>
        </div>
      ) : (
        <div className="contracts-grid">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="contract-card"
              onClick={() => navigate(`/contracts/${contract.id}`)}
            >
              <div className="card-header">
                <h3>Job #{contract.jobId.substring(0, 8)}</h3>
                <div className={`status-badge status-${contract.status.toLowerCase()}`}>
                  {contract.status}
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Value:</span>
                  <span className="value">${contract.totalValue.toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Start Date:</span>
                  <span className="value">{new Date(contract.startDate).toLocaleDateString()}</span>
                </div>
                {contract.endDate && (
                  <div className="info-row">
                    <span className="label">End Date:</span>
                    <span className="value">{new Date(contract.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="card-action">
                View Details →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
