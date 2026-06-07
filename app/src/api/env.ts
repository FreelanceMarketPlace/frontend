function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export const env = {
  // Treat empty strings as unset (use `||` instead of `??`) so preview/dev envs
  // that set an empty VITE_* variable won't cause a relative baseURL.
  userApiBaseUrl: stripTrailingSlash(import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:8081'),
  jobApiBaseUrl: stripTrailingSlash(import.meta.env.VITE_JOB_API_BASE_URL || 'http://localhost:8082'),
  contractApiBaseUrl: stripTrailingSlash(import.meta.env.VITE_CONTRACT_API_BASE_URL || 'http://localhost:8083'),
  paymentApiBaseUrl: stripTrailingSlash(import.meta.env.VITE_PAYMENT_API_BASE_URL || 'http://localhost:8084'),
}
