import { useState } from 'react'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, csrfToken, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    const csrfElement = event.currentTarget.elements.namedItem('csrfToken')
    const submittedCsrfToken = csrfElement instanceof HTMLInputElement ? csrfElement.value : ''

    const result = await login({ email, password, submittedCsrfToken })

    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    const destination = location.state?.from || '/dashboard'
    navigate(destination, { replace: true })
  }

  return (
    <main className="page auth-page">
      <Header title="Login" subtitle="Secure access for seniors and caregivers." />
      <NavButtons />

      <section className="panel auth-panel">
        <h2>Sign in to IM OK</h2>
        <p className="auth-subtitle">Log in to access your protected senior and caregiver views.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="csrfToken" readOnly type="hidden" value={csrfToken} />

          <label className="auth-field">
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="john@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="auth-field">
            Password
            <input
              autoComplete="current-password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Please wait...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/auth/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
