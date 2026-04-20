export type UserRole = 'EMPLOYER' | 'FREELANCER' | 'ADMIN' | 'SUPPORTER'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'BANNED'

export interface UserResponse {
  id: string
  email: string
  role: UserRole
  status: UserStatus
}

export interface AuthResponse {
  accessToken: string
  expiresInSeconds: number
  user: UserResponse
}

export interface RegisterRequest {
  email: string
  password: string
  role: Extract<UserRole, 'EMPLOYER' | 'FREELANCER'>
}

export interface RegisterResponse {
  user: UserResponse
}

export interface LoginRequest {
  email: string
  password: string
}
