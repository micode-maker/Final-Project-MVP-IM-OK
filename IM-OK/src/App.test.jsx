import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'
import { CheckInProvider } from './contexts/CheckInContext.jsx'
import { fetchMotivationalQuote } from './utilities/fetchQuote.js'

vi.mock('./utilities/fetchQuote.js', () => ({
  fetchMotivationalQuote: vi.fn(),
}))

function renderApp(initialRoute = '/') {
  render(
    <CheckInProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </CheckInProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('App routes', () => {
  test('renders home route', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { name: /^welcome$/i })).toBeInTheDocument()
  })

  test('renders dynamic profile section route', () => {
    renderApp('/profile/preferences')

    expect(screen.getByRole('heading', { name: /check-in preferences/i })).toBeInTheDocument()
  })

  test('renders not found route', () => {
    renderApp('/does-not-exist')

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})

describe('Dashboard behavior', () => {
  test('shows initial pending dashboard state', () => {
    renderApp('/dashboard')

    expect(screen.getByText(/waiting for today's check-in/i)).toBeInTheDocument()
    expect(
      screen.getByText(/complete a check-in to load your motivational quote/i),
    ).toBeInTheDocument()
  })

  test('check-in updates status and streak', async () => {
    fetchMotivationalQuote.mockResolvedValueOnce({
      quote: 'Test quote text',
      author: 'Test Author',
    })

    renderApp('/dashboard')
    const user = userEvent.setup()

    expect(screen.getByText(/^0$/)).toBeInTheDocument()

    const checkInButton = screen.getByRole('button', { name: /tap to complete your daily check-in/i })
    await user.click(checkInButton)

    expect(await screen.findByText(/^Checked in for today$/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/^1$/)).toBeInTheDocument())
    expect(checkInButton).toBeDisabled()
  })

  test('shows loading feedback while fetching quote', async () => {
    let resolveQuote
    fetchMotivationalQuote.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveQuote = resolve
        }),
    )

    renderApp('/dashboard')
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /tap to complete your daily check-in/i }))
    expect(screen.getByText(/loading quote/i)).toBeInTheDocument()

    resolveQuote({ quote: 'Momentum matters.', author: 'Mentor' })

    expect(await screen.findByText(/momentum matters/i)).toBeInTheDocument()
  })

  test('shows quote and author after successful check-in', async () => {
    fetchMotivationalQuote.mockResolvedValueOnce({
      quote: 'Life rewards consistency.',
      author: 'Coach Riley',
    })

    renderApp('/dashboard')
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /tap to complete your daily check-in/i }))

    expect(await screen.findByText(/life rewards consistency\./i)).toBeInTheDocument()
    expect(screen.getByText(/coach riley/i)).toBeInTheDocument()
    await waitFor(() => expect(fetchMotivationalQuote).toHaveBeenCalledTimes(1))
  })

  test('shows error message when quote request fails', async () => {
    fetchMotivationalQuote.mockRejectedValueOnce(new Error('API temporarily unavailable'))

    renderApp('/dashboard')
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /tap to complete your daily check-in/i }))

    expect(await screen.findByText(/api temporarily unavailable/i)).toBeInTheDocument()
  })
})

describe('Context across routes', () => {
  test('caregiver route reflects updated check-in status', async () => {
    fetchMotivationalQuote.mockResolvedValueOnce({
      quote: 'You did it.',
      author: 'A Mentor',
    })

    renderApp('/dashboard')
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /tap to complete your daily check-in/i }))
    expect(await screen.findByText(/^Checked in for today$/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /caregiver/i }))

    expect(await screen.findByText(/senior has checked in today/i)).toBeInTheDocument()
    expect(screen.getByText(/^1$/)).toBeInTheDocument()
  })
})
