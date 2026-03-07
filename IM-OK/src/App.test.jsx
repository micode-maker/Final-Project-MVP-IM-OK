import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'
import { AuthProvider, AUTH_TOKEN_STORAGE_KEY, AUTH_USERS_STORAGE_KEY } from './contexts/AuthContext.jsx'
import { CheckInProvider } from './contexts/CheckInContext.jsx'
import { fetchMotivationalQuote } from './utilities/fetchQuote.js'

vi.mock('./utilities/fetchQuote.js', () => ({
  fetchMotivationalQuote: vi.fn(),
}))

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'development-only-secret'

function encodeBase64Url(input) {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function createSignature(headerPayload, secret) {
  return encodeBase64Url(`${headerPayload}.${secret}`)
}

function createSignedJwt(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const encodedHeader = encodeBase64Url(JSON.stringify(header))
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const headerPayload = `${encodedHeader}.${encodedPayload}`
  const signature = createSignature(headerPayload, secret)

  return `${headerPayload}.${signature}`
}

async function hashPassword(password) {
  const normalizedPassword = password.trim()

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(normalizedPassword))
    const hashBytes = Array.from(new Uint8Array(hashBuffer))

    return hashBytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  return btoa(normalizedPassword)
}

function createTestToken(userOverrides = {}, payloadOverrides = {}) {
  const now = Math.floor(Date.now() / 1000)
  const user = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    ...userOverrides,
  }

  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: 'senior',
    iat: now,
    exp: now + 60 * 60,
    ...payloadOverrides,
  }

  return createSignedJwt(payload, JWT_SECRET)
}

function seedAuthenticatedSession(userOverrides = {}, payloadOverrides = {}) {
  const token = createTestToken(userOverrides, payloadOverrides)
  window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

function renderApp(initialRoute = '/') {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <CheckInProvider>
          <App />
        </CheckInProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

function clearStorageSafely(storage) {
  if (!storage) {
    return
  }

  if (typeof storage.clear === 'function') {
    storage.clear()
    return
  }

  if (typeof storage.length === 'number' && typeof storage.key === 'function' && typeof storage.removeItem === 'function') {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index)

      if (typeof key === 'string') {
        storage.removeItem(key)
      }
    }
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  clearStorageSafely(window.localStorage)
  clearStorageSafely(window.sessionStorage)
})

describe('Routing and protected access', () => {
  test('renders public home route', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
  })

  test('redirects unauthenticated users to login when hitting dashboard', () => {
    renderApp('/dashboard')

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  test('blocks expired JWT from protected routes', () => {
    seedAuthenticatedSession({}, { exp: Math.floor(Date.now() / 1000) - 10 })

    renderApp('/dashboard')

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  test('renders not found route', () => {
    renderApp('/missing')

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})

describe('Authentication flows', () => {
  test('registers successfully and navigates to dashboard', async () => {
    renderApp('/auth/register')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/full name/i), 'Jane Senior')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /^register$/i }))

    expect(await screen.findByRole('heading', { name: /senior dashboard/i })).toBeInTheDocument()

    const storedUsers = JSON.parse(window.localStorage.getItem(AUTH_USERS_STORAGE_KEY))
    expect(storedUsers).toHaveLength(1)
    expect(storedUsers[0].email).toBe('jane@example.com')
  })

  test('shows error for invalid login credentials', async () => {
    const passwordHash = await hashPassword('CorrectPassword1')
    window.localStorage.setItem(
      AUTH_USERS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'user-1',
          name: 'Jane Senior',
          email: 'jane@example.com',
          passwordHash,
          createdAt: new Date().toISOString(),
        },
      ]),
    )

    renderApp('/auth/login')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword1')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })

  test('rejects form submission when csrf token is tampered', async () => {
    renderApp('/auth/register')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/full name/i), 'Evan Senior')
    await user.type(screen.getByLabelText(/email/i), 'evan@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')

    const csrfInput = document.querySelector('input[name="csrfToken"]')
    csrfInput.value = 'tampered-token'
    await user.click(screen.getByRole('button', { name: /^register$/i }))

    expect(await screen.findByText(/security check failed/i)).toBeInTheDocument()
  })

  test('logout clears session and returns to login-protected flow', async () => {
    seedAuthenticatedSession()
    renderApp('/dashboard')
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /logout/i }))
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
  })
})

describe('Dashboard and shared context', () => {
  test('check-in updates status and streak and loads quote', async () => {
    seedAuthenticatedSession()
    fetchMotivationalQuote.mockResolvedValueOnce({
      quote: 'Test quote text',
      author: 'Test Author',
    })

    renderApp('/dashboard')
    const user = userEvent.setup()

    expect(screen.getByText(/^0$/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /tap to complete your daily check-in/i }))

    expect(await screen.findByText(/^Checked in for today$/i)).toBeInTheDocument()
    expect(await screen.findByText(/test quote text/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/^1$/)).toBeInTheDocument())
  })

  test('shows quote api error when quote request fails', async () => {
    seedAuthenticatedSession()
    fetchMotivationalQuote.mockRejectedValueOnce(new Error('API temporarily unavailable'))

    renderApp('/dashboard')
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /tap to complete your daily check-in/i }))

    expect(await screen.findByText(/api temporarily unavailable/i)).toBeInTheDocument()
  })

  test('caregiver route reflects updated check-in status from context', async () => {
    seedAuthenticatedSession()
    fetchMotivationalQuote.mockResolvedValueOnce({
      quote: 'You did it.',
      author: 'A Mentor',
    })

    renderApp('/dashboard')
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /tap to complete your daily check-in/i }))
    expect(await screen.findByText(/^Checked in for today$/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /^caregiver$/i }))

    expect(await screen.findByText(/senior has checked in today/i)).toBeInTheDocument()
    expect(screen.getByText(/^1$/)).toBeInTheDocument()
  })
})
