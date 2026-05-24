export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'DISPUTED'

export interface ContractResponse {
  id: string
  jobId: string
  offerId: string
  employerId: string
  freelancerId: string
  totalValue: number
  status: ContractStatus
  startDate: string
  endDate: string | null
  createdAt: string
}

export interface MilestoneResponse {
  id: string
  contractId: string
  title: string
  description: string
  amount: number
  dueDate: string
  status: MilestoneStatus
  revisionCount: number
  maxRevisions: number
  createdAt: string
}

export interface DeliverableResponse {
  id: string
  milestoneId: string
  fileUrl: string | null
  linkUrl: string | null
  description: string | null
  submittedAt: string
}

export interface EscrowResponse {
  id: string
  milestoneId: string
  amount: number
  isFrozen: boolean
  lockedAt: string | null
  releasedAt: string | null
}

export interface ContractDetailResponse {
  contract: ContractResponse
  milestones: MilestoneResponse[]
  deliverables: DeliverableResponse[]
  escrow: EscrowResponse | null
}

// Request types
export interface CreateContractRequest {
  offerId: string
}

export interface MilestoneSubmitRequest {
  fileUrl?: string
  linkUrl?: string
  description?: string
}

export interface RevisionRequest {
  revisionDesc: string
}

export interface MilestoneApproveRequest {
  confirmedByEmployerId: string
}
