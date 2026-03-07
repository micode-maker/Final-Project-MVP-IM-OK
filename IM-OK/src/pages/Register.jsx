import { useState } from 'react'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

function Register() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, csrfToken, register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const csrfElement = event.currentTarget.elements.namedItem('csrfToken')
    const submittedCsrfToken = csrfElement instanceof HTMLInputElement ? csrfElement.value : ''

    const result = await register({ name, email, password, submittedCsrfToken })

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
      <Header title="Register" subtitle="Create your secure IM OK account." />
      <NavButtons />

      <section className="panel auth-panel">
        <h2>Create your account</h2>
        <p className="auth-subtitle">Register to look at dashboard and caregiver data.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="csrfToken" readOnly type="hidden" value={csrfToken} />

          <label className="auth-field">
            Full name
            <input
              autoComplete="name"
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="John Doe"
              required
              type="text"
              value={name}
            />
          </label>

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
              autoComplete="new-password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              required
              type="password"
              value={password}
            />
          </label>

          <label className="auth-field">
            Confirm password
            <input
              autoComplete="new-password"
              minLength={8}
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Please wait...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/auth/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
