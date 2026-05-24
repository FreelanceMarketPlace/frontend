import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import { clearAccessToken, getAccessToken, setAccessToken } from '../auth/tokenStore'
import type { AuthResponse } from '../types/user'

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean; _skipAuthRefresh?: boolean }

export const userAuthHttp = axios.create({
  baseURL: env.userApiBaseUrl,
  withCredentials: true,
})

export const userHttp = axios.create({
  baseURL: env.userApiBaseUrl,
  withCredentials: true,
})

export const jobHttp = axios.create({
  baseURL: env.jobApiBaseUrl,
  withCredentials: true,
})

export const contractHttp = axios.create({
  baseURL: env.contractApiBaseUrl,
  withCredentials: true,
})

function attachBearer(config: InternalAxiosRequestConfig) {
  const token = getAccessToken()
  if (token) {
    const headers: any = config.headers
    if (headers && typeof headers.set === 'function') {
      headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers = { ...(headers ?? {}), Authorization: `Bearer ${token}` } as any
    }
  }
  return config
}

function isPublicJobBrowseRequest(cfg: InternalAxiosRequestConfig) {
  const method = (cfg.method ?? 'get').toLowerCase()
  if (method !== 'get') return false
  const rawUrl = cfg.url ?? ''
  const path = rawUrl.split('?')[0]
  // Public: job list (`/jobs`) and job detail (`/jobs/{id}`) only.
  if (path === '/jobs') return true
  if (path.startsWith('/jobs/')) {
    const rest = path.substring('/jobs/'.length)
    // treat `/jobs/{id}` (no extra segments) as public; anything with extra
    // path segments (e.g. `/jobs/{id}/proposals`) requires auth
    if (!rest.includes('/')) return true
    return false
  }
  return false
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await userAuthHttp.post<AuthResponse>('/auth/refresh', {})
    const token = res.data.accessToken
    setAccessToken(token)
    return token
  } catch {
    clearAccessToken()
    return null
  }
}

function installAuthInterceptors(
  client: AxiosInstance,
  opts?: {
    shouldAttachToken?: (cfg: InternalAxiosRequestConfig) => boolean
    shouldAttemptRefresh?: (cfg: RetryConfig) => boolean
  },
) {
  client.interceptors.request.use((cfg) => {
    if (opts?.shouldAttachToken && !opts.shouldAttachToken(cfg)) return cfg
    return attachBearer(cfg)
  })

  client.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const cfg = err.config as RetryConfig | undefined
      const status = err.response?.status

      if (!cfg || cfg._skipAuthRefresh) throw err
      if (status !== 401) throw err
      if (cfg._retry) throw err

      if (opts?.shouldAttemptRefresh && !opts.shouldAttemptRefresh(cfg)) throw err

      // Do not attempt refresh while calling auth endpoints
      if (cfg.url?.startsWith('/auth/')) throw err

      cfg._retry = true

      refreshPromise = refreshPromise ?? refreshAccessToken()
      const newToken = await refreshPromise
      refreshPromise = null

      if (!newToken) throw err

      const headers: any = cfg.headers
      if (headers && typeof headers.set === 'function') {
        headers.set('Authorization', `Bearer ${newToken}`)
      } else {
        cfg.headers = { ...(headers ?? {}), Authorization: `Bearer ${newToken}` } as any
      }
      return client.request(cfg)
    },
  )
}

installAuthInterceptors(userHttp)
installAuthInterceptors(jobHttp, {
  shouldAttachToken: (cfg) => !isPublicJobBrowseRequest(cfg),
  shouldAttemptRefresh: (cfg) => !isPublicJobBrowseRequest(cfg),
})
installAuthInterceptors(contractHttp)
