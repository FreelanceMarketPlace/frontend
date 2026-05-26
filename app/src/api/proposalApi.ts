import { jobHttp } from './http'
import type {
  SubmitProposalRequest,
  ProposalResponse,
  PageResponse,
  OfferResponse,
  CreateOfferRequest,
  ProposalAttachmentResponse,
} from '../types/proposal'

/**
 * Submit a proposal for a job
 */
export async function submitProposal(jobId: string, req: SubmitProposalRequest, attachments: File[] = []) {
  const formData = new FormData()
  formData.append('proposal', new Blob([JSON.stringify(req)], { type: 'application/json' }))
  for (const file of attachments) {
    formData.append('attachments', file)
  }

  const res = await jobHttp.post<ProposalResponse>(`/jobs/${jobId}/proposals`, formData)
  return res.data
}

/**
 * Get proposals for a specific job (Employer only)
 */
export async function getJobProposals(jobId: string, status?: string, page = 0, size = 20) {
  const params: Record<string, any> = { page, size }
  if (status) {
    params.status = status
  }
  const res = await jobHttp.get<PageResponse<ProposalResponse>>(`/jobs/${jobId}/proposals`, { params })
  return {
    ...res.data,
    items: res.data.items.map(p => ({
      ...p,
      attachments: p.attachments ?? []
    }))
  }
}

/**
 * Get all proposals by freelancer
 */
export async function getFreelancerProposals(status?: string, page = 0, size = 20) {
  const params: Record<string, any> = { page, size }
  if (status) {
    params.status = status
  }
  const res = await jobHttp.get<PageResponse<ProposalResponse>>('/freelancer/proposals', { params })
  return {
    ...res.data,
    items: res.data.items.map(p => ({
      ...p,
      attachments: p.attachments ?? []
    }))
  }
}

/**
 * Accept a proposal (Employer only)
 */
export async function shortlistProposal(proposalId: string) {
  const res = await jobHttp.post<ProposalResponse>(`/proposals/${proposalId}/shortlist`, {})
  return res.data
}

export async function acceptProposal(proposalId: string) {
  return shortlistProposal(proposalId)
}

/**
 * Reject a proposal (Employer only)
 */
export async function rejectProposal(proposalId: string) {
  const res = await jobHttp.post<ProposalResponse>(`/proposals/${proposalId}/reject`, {})
  return res.data
}

/**
 * Withdraw a proposal (Freelancer only)
 */
export async function withdrawProposal(proposalId: string) {
  const res = await jobHttp.post<ProposalResponse>(`/proposals/${proposalId}/withdraw`, {})
  return res.data
}

export async function downloadProposalAttachment(proposalId: string, attachment: ProposalAttachmentResponse) {
  const res = await jobHttp.get<Blob>(attachment.downloadUrl ?? `/proposals/${proposalId}/attachments/${attachment.attachmentId}/download`, {
    responseType: 'blob',
  })
  return res.data
}

export async function createOffer(proposalId: string, req: CreateOfferRequest) {
  const res = await jobHttp.post<OfferResponse>(`/proposals/${proposalId}/offers`, req)
  return res.data
}

export async function getFreelancerOffers(status?: string, page = 0, size = 20) {
  const params: Record<string, any> = { page, size }
  if (status) {
    params.status = status
  }
  const res = await jobHttp.get<PageResponse<OfferResponse>>('/freelancer/offers', { params })
  return res.data
}

export async function acceptOffer(offerId: string) {
  const res = await jobHttp.post<OfferResponse>(`/offers/${offerId}/accept`, {})
  return res.data
}

export async function declineOffer(offerId: string) {
  const res = await jobHttp.post<OfferResponse>(`/offers/${offerId}/decline`, {})
  return res.data
}
