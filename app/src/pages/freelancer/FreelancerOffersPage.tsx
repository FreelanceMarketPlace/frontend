import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import * as proposalApi from '../../api/proposalApi'
import type { OfferResponse, OfferStatus } from '../../types/proposal'

const statusColors: Record<OfferStatus, string> = {
  PENDING: 'pill-primary',
  ACCEPTED: 'pill-success',
  DECLINED: 'pill-error',
  EXPIRED: 'pill-muted',
}

const statusLabels: Record<OfferStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
}

export function FreelancerOffersPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offers, setOffers] = useState<OfferResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<OfferStatus | 'ALL'>('ALL')
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
        const res = await proposalApi.getFreelancerOffers(status, page, PAGE_SIZE)
        if (!cancelled) {
          setOffers(res.items)
          setPageInfo({ totalElements: res.totalElements, totalPages: res.totalPages })
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load offers')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, selectedStatus, page])

  const handleAccept = async (offerId: string) => {
    try {
      await proposalApi.acceptOffer(offerId)
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus
      const res = await proposalApi.getFreelancerOffers(status, page, PAGE_SIZE)
      setOffers(res.items)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to accept offer')
    }
  }

  const handleDecline = async (offerId: string) => {
    try {
      await proposalApi.declineOffer(offerId)
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus
      const res = await proposalApi.getFreelancerOffers(status, page, PAGE_SIZE)
      setOffers(res.items)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to decline offer')
    }
  }

  if (loading) return <div className="hint">Loading offers…</div>

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="page-title">My Offers</h1>
        <p className="page-subtitle">Review offers received from employers</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="row" style={{ gap: 8 }}>
        {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as const).map((status) => (
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

      {offers.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          No offers found
        </div>
      ) : (
        <div className="stack" style={{ gap: 8 }}>
          {offers.map((offer) => (
            <div key={offer.offerId} className="card card-pad stack" style={{ gap: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stack" style={{ gap: 4, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{offer.jobDescription}</div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className={`pill ${statusColors[offer.status]}`}>{statusLabels[offer.status]}</span>
                    <span className="hint">Expires: {new Date(offer.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>${offer.contractValue.toFixed(2)}</div>
                  <div className="hint" style={{ fontSize: 12 }}>{offer.estimatedDuration} days</div>
                </div>
              </div>

              <div className="divider" />

              {offer.status === 'PENDING' && (
                <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline" onClick={() => handleDecline(offer.offerId)} style={{ color: 'var(--error)' }}>
                    Decline
                  </button>
                  <button className="btn btn-primary" onClick={() => handleAccept(offer.offerId)}>
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pageInfo.totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
          <button className="btn" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
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
    </div>
  )
}
