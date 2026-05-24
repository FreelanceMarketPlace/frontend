import { contractHttp } from './http'
import type {
  ContractResponse,
  MilestoneResponse,
  DeliverableResponse,
  EscrowResponse,
  MilestoneSubmitRequest,
  RevisionRequest,
} from '../types/contract'

// ============ Contract Endpoints ============

export async function createContractFromOffer(offerId: string) {
  const res = await contractHttp.post<ContractResponse>(`/api/contracts/from-offer/${offerId}`)
  return res.data
}

export async function getContractDetail(contractId: string) {
  const res = await contractHttp.get<ContractResponse>(`/api/contracts/${contractId}`)
  return res.data
}

export async function getEmployerContracts(employerId: string) {
  const res = await contractHttp.get<ContractResponse[]>(`/api/contracts/employer/${employerId}`)
  return res.data
}

export async function getFreelancerContracts(freelancerId: string) {
  const res = await contractHttp.get<ContractResponse[]>(`/api/contracts/freelancer/${freelancerId}`)
  return res.data
}

// ============ Milestone Endpoints ============

export async function getContractMilestones(contractId: string) {
  const res = await contractHttp.get<MilestoneResponse[]>(`/api/contracts/${contractId}/milestones`)
  return res.data
}

export async function submitMilestone(milestoneId: string, request: MilestoneSubmitRequest) {
  const res = await contractHttp.post<DeliverableResponse>(`/api/milestones/${milestoneId}/submit`, request)
  return res.data
}

export async function requestRevision(milestoneId: string, request: RevisionRequest) {
  const res = await contractHttp.post<MilestoneResponse>(`/api/milestones/${milestoneId}/revision`, request)
  return res.data
}

export async function approveMilestone(milestoneId: string) {
  const res = await contractHttp.post<MilestoneResponse>(`/api/milestones/${milestoneId}/approve`)
  return res.data
}

// ============ Escrow Endpoints ============

export async function lockEscrow(milestoneId: string, amount: number) {
  const res = await contractHttp.post<EscrowResponse>(`/api/escrows/${milestoneId}/lock`, null, {
    params: { amount },
  })
  return res.data
}

export async function releaseEscrow(milestoneId: string) {
  const res = await contractHttp.post<EscrowResponse>(`/api/escrows/${milestoneId}/release`)
  return res.data
}

export async function getEscrow(milestoneId: string) {
  const res = await contractHttp.get<EscrowResponse>(`/api/escrows/${milestoneId}`)
  return res.data
}
