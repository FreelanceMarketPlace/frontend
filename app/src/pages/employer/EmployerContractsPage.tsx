import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmployerContracts } from '../../api/contractApi'
import { useAuth } from '../../auth/AuthContext'
import type { ContractResponse } from '../../types/contract'
import './EmployerContractsPage.css'

export function EmployerContractsPage() {
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
        const data = await getEmployerContracts(user.id)
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
    return <div className="employer-contracts loading">Loading contracts...</div>
  }

  if (error) {
    return <div className="employer-contracts error">Error: {error}</div>
  }

  return (
    <div className="employer-contracts">
      <div className="page-header">
        <h1>Project Contracts</h1>
        <p className="subtitle">Monitor and manage contracts with your freelancers</p>
      </div>

      {contracts.length === 0 ? (
        <div className="empty-state">
          <h2>No Contracts Yet</h2>
          <p>Post jobs and accept freelancer proposals to create contracts</p>
          <button className="btn btn-primary" onClick={() => navigate('/employer/jobs')}>
            View My Jobs
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
                  <span className="label">Freelancer ID:</span>
                  <span className="value">{contract.freelancerId.substring(0, 12)}...</span>
                </div>
                <div className="info-row">
                  <span className="label">Value:</span>
                  <span className="value">${contract.totalValue.toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Start Date:</span>
                  <span className="value">{new Date(contract.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-action">
                Review Milestones →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
