const ACCESS_TOKEN_KEY = 'access_token'

let cached: string | null = null

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getAccessToken(): string | null {
  if (cached !== null) return cached
  if (!canUseStorage()) return null
  cached = window.localStorage.getItem(ACCESS_TOKEN_KEY)
  return cached
}

export function setAccessToken(token: string) {
  cached = token
  if (canUseStorage()) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  }
}

export function clearAccessToken() {
  cached = null
  if (canUseStorage()) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}
