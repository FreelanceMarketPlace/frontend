export type BudgetType = 'FIXED' | 'HOURLY'
export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface JobListItem {
  id: string
  employerId: string
  title: string
  requiredSkills: string[]
  budgetType: BudgetType
  fixedBudget?: number | null
  hourlyRate?: number | null
  estimatedHours?: number | null
  deadline?: string | null
  status: JobStatus
  proposalCount: number
  createdAt: string
  updatedAt: string
}

export interface JobDetail extends JobListItem {
  description: string
}

export interface CreateJobRequest {
  title: string
  description: string
  requiredSkills?: string[]
  budgetType: BudgetType
  fixedBudget?: number
  hourlyRate?: number
  estimatedHours?: number
  deadline?: string
}

export type UpdateJobRequest = Partial<CreateJobRequest>

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
