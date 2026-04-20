import { userAuthHttp, userHttp } from './http'
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, UserResponse } from '../types/user'

export async function register(req: RegisterRequest) {
  const res = await userAuthHttp.post<RegisterResponse>('/auth/register', req)
  return res.data
}

export async function login(req: LoginRequest) {
  const res = await userAuthHttp.post<AuthResponse>('/auth/login', req)
  return res.data
}

export async function refresh() {
  const res = await userAuthHttp.post<AuthResponse>('/auth/refresh', {})
  return res.data
}

export async function logout() {
  await userAuthHttp.post('/auth/logout', {})
}

export async function me() {
  const res = await userHttp.get<UserResponse>('/me')
  return res.data
}

export async function listUsers(page = 0, size = 20) {
  const res = await userHttp.get<{ items: UserResponse[]; page: number; size: number; totalElements: number; totalPages: number }>(
    '/users',
    { params: { page, size } },
  )
  return res.data
}
