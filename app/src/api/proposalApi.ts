import { jobHttp } from './http'
import type { SubmitProposalRequest, ProposalResponse, PageResponse } from '../types/proposal'

/**
 * Submit a proposal for a job
 */
export async function submitProposal(jobId: string, req: SubmitProposalRequest) {
  const res = await jobHttp.post<ProposalResponse>(`/jobs/${jobId}/proposals`, req)
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
  return res.data
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
  return res.data
}

/**
 * Accept a proposal (Employer only)
 */
export async function acceptProposal(proposalId: string) {
  const res = await jobHttp.post<ProposalResponse>(`/proposals/${proposalId}/accept`, {})
  return res.data
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
