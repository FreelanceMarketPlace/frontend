function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export const env = {
  userApiBaseUrl: stripTrailingSlash(import.meta.env.VITE_USER_API_BASE_URL ?? 'http://localhost:8081'),
  jobApiBaseUrl: stripTrailingSlash(import.meta.env.VITE_JOB_API_BASE_URL ?? 'http://localhost:8082'),
  contractApiBaseUrl: stripTrailingSlash(import.meta.env.VITE_CONTRACT_API_BASE_URL ?? 'http://localhost:8083'),
}
