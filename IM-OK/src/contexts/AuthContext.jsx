import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AUTH_USERS_STORAGE_KEY = 'im-ok-users'
export const AUTH_TOKEN_STORAGE_KEY = 'im-ok-auth-token'
export const AUTH_USER_STORAGE_KEY = 'im-ok-auth-user'
export const AUTH_CSRF_STORAGE_KEY = 'im-ok-csrf-token'

const TOKEN_TTL_SECONDS = 60 * 60 * 8

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function createToken(user) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'senior',
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.mock_signature`
}

function readTokenPayload(token) {
  if (typeof token !== 'string') {
    return null
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  try {
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}

function tokenIsValid(token) {
  const payload = readTokenPayload(token)
  return Boolean(payload && typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000))
}

function clearAuthSession() {
  window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

function loadStoredUsers() {
  const parsed = parseJson(window.localStorage.getItem(AUTH_USERS_STORAGE_KEY), [])
  return Array.isArray(parsed) ? parsed : []
}

async function hashPassword(password) {
  const normalized = String(password || '').trim()

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(normalized))
    const hashBytes = Array.from(new Uint8Array(hashBuffer))
    return hashBytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  return btoa(normalized)
}

function getOrCreateCsrfToken() {
  const existing = window.sessionStorage.getItem(AUTH_CSRF_STORAGE_KEY)

  if (existing) {
    return existing
  }

  const token = `${Date.now()}-${Math.random()}`
  window.sessionStorage.setItem(AUTH_CSRF_STORAGE_KEY, token)
  return token
}

function normalizeStoredUser(parsedUser, token) {
  if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
    return parsedUser
  }

  const payload = readTokenPayload(token)

  if (!payload?.sub || !payload?.email) {
    return null
  }

  return {
    id: payload.sub,
    name: payload.name || payload.email,
    username: payload.name || payload.email,
    email: payload.email,
    role: payload.role || 'senior',
  }
}

function loadStoredSessionUser() {
  const token = window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (!token || !tokenIsValid(token)) {
    clearAuthSession()
    return null
  }

  const parsedUser = parseJson(window.sessionStorage.getItem(AUTH_USER_STORAGE_KEY), null)
  const user = normalizeStoredUser(parsedUser, token)

  if (!user) {
    clearAuthSession()
    return null
  }

  return user
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredSessionUser)
  const [csrfToken, setCsrfToken] = useState(() => getOrCreateCsrfToken())

  const rotateCsrfToken = () => {
    window.sessionStorage.removeItem(AUTH_CSRF_STORAGE_KEY)
    setCsrfToken(getOrCreateCsrfToken())
  }

  const login = async (inputOrEmail, maybePassword, maybeRole = 'senior') => {
    let email = ''
    let password = ''
    let submittedCsrfToken = ''

    if (typeof inputOrEmail === 'object' && inputOrEmail !== null) {
      email = String(inputOrEmail.email || '').trim().toLowerCase()
      password = String(inputOrEmail.password || '')
      submittedCsrfToken = String(inputOrEmail.submittedCsrfToken || '')
    } else {
      email = String(inputOrEmail || '').trim().toLowerCase()
      password = String(maybePassword || '')
    }

    if (submittedCsrfToken && submittedCsrfToken !== csrfToken) {
      return { ok: false, error: 'Security check failed. Please refresh and try again.' }
    }

    const existingUser = loadStoredUsers().find((entry) => entry.email === email)

    if (!existingUser) {
      return { ok: false, error: 'Invalid credentials.' }
    }

    const plainPasswordMatch =
      typeof existingUser.password === 'string' && existingUser.password === password
    let hashedPasswordMatch = false

    if (!plainPasswordMatch && typeof existingUser.passwordHash === 'string') {
      const passwordHash = await hashPassword(password)
      hashedPasswordMatch = existingUser.passwordHash === passwordHash
    }

    if (!plainPasswordMatch && !hashedPasswordMatch) {
      return { ok: false, error: 'Invalid credentials.' }
    }

    const authedUser = {
      id: existingUser.id,
      name: existingUser.name || existingUser.username || existingUser.email,
      username: existingUser.username || existingUser.name || existingUser.email,
      email: existingUser.email,
      role: existingUser.role || maybeRole,
    }

    const token = createToken(authedUser)
    setUser(authedUser)
    window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    window.sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authedUser))
    rotateCsrfToken()

    return { ok: true, user: authedUser }
  }

  const register = async (inputOrUsername, maybePassword) => {
    let name = ''
    let email = ''
    let password = ''
    let submittedCsrfToken = ''

    if (typeof inputOrUsername === 'object' && inputOrUsername !== null) {
      name = String(inputOrUsername.name || '').trim()
      email = String(inputOrUsername.email || '').trim().toLowerCase()
      password = String(inputOrUsername.password || '')
      submittedCsrfToken = String(inputOrUsername.submittedCsrfToken || '')
    } else {
      name = String(inputOrUsername || '').trim()
      email = `${name.toLowerCase().replace(/\s+/g, '')}@example.com`
      password = String(maybePassword || '')
    }

    if (submittedCsrfToken && submittedCsrfToken !== csrfToken) {
      return { ok: false, error: 'Security check failed. Please refresh and try again.' }
    }

    if (!name || !email || password.length < 8) {
      return { ok: false, error: 'Please enter valid registration details.' }
    }

    const users = loadStoredUsers()
    const alreadyExists = users.some((entry) => entry.email === email)

    if (alreadyExists) {
      return { ok: false, error: 'An account with this email already exists.' }
    }

    const createdUser = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `user-${Date.now()}`,
      name,
      username: name,
      email,
      password,
      role: 'senior',
      createdAt: new Date().toISOString(),
    }

    window.localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify([...users, createdUser]))
    return login({ email, password, submittedCsrfToken: csrfToken })
  }

  const logout = () => {
    setUser(null)
    clearAuthSession()
    rotateCsrfToken()
  }

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading: false,
    csrfToken,
    login,
    register,
    logout,
    hasRole: (role) => user?.role === role,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
