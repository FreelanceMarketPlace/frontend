export type ProposalStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN'
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

export interface SubmitProposalRequest {
  coverLetter: string
  estimatedDuration: number
}

export interface ProposalAttachmentResponse {
  attachmentId: string
  fileName: string
  mimeType: string
  fileSize: number
  uploadedAt: string
  downloadUrl: string
}

export interface ProposalResponse {
  id: string
  jobId: string
  jobTitle: string
  freelancerId: string
  coverLetter: string
  estimatedDuration: number
  status: ProposalStatus
  createdAt: string
  updatedAt: string
  respondedAt: string | null
  attachments?: ProposalAttachmentResponse[]
}

export interface CreateOfferRequest {
  estimatedDuration: number
  jobDescription: string
  expiresAt?: string
}

export interface OfferResponse {
  offerId: string
  jobId: string
  proposalId: string
  employerId: string
  freelancerId: string
  jobDescription: string
  contractValue: number
  estimatedDuration: number
  status: OfferStatus
  expiresAt: string
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
