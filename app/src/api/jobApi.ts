import { jobHttp } from './http'
import type { CreateJobRequest, JobDetail, JobListItem, PageResponse, UpdateJobRequest } from '../types/job'

export async function listJobs(params: {
  q?: string
  skills?: string[]
  budgetType?: 'FIXED' | 'HOURLY'
  minBudget?: number
  maxBudget?: number
  sort?: 'NEWEST' | 'BUDGET_ASC' | 'BUDGET_DESC'
  page?: number
  size?: number
}) {
  const res = await jobHttp.get<PageResponse<JobListItem>>('/jobs', { params })
  return res.data
}

export async function getJob(jobId: string) {
  const res = await jobHttp.get<JobDetail>(`/jobs/${jobId}`)
  return res.data
}

export async function listEmployerJobs(params: { status?: string; page?: number; size?: number }) {
  const res = await jobHttp.get<PageResponse<JobListItem>>('/employer/jobs', { params })
  return res.data
}

export async function createJob(req: CreateJobRequest) {
  const res = await jobHttp.post<JobDetail>('/jobs', req)
  return res.data
}

export async function updateJob(jobId: string, req: UpdateJobRequest) {
  const res = await jobHttp.patch<JobDetail>(`/jobs/${jobId}`, req)
  return res.data
}

export async function closeJob(jobId: string) {
  const res = await jobHttp.post<JobDetail>(`/jobs/${jobId}/close`, {})
  return res.data
}
