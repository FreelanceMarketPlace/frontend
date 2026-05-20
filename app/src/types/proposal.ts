export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export interface SubmitProposalRequest {
  bidAmount: number
  message: string
}

export interface ProposalResponse {
  id: string
  jobId: string
  jobTitle: string
  freelancerId: string
  bidAmount: number
  message: string
  status: ProposalStatus
  createdAt: string
  updatedAt: string
  respondedAt: string | null
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
