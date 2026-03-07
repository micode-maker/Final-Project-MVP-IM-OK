import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <main className="page home-page">
      <Header
        title={isAuthenticated ? `Welcome back, ${user.name}` : 'Welcome'}
        subtitle="Daily check-ins with secure access for seniors and caregivers."
      />
      <NavButtons />

      <section className="panel">
        <h2>How it works</h2>
        <p>
          Tap your character once each day to confirm you are okay. Caregivers can review status
          and streak progress. Authentication now protects dashboard and profile data.
        </p>
        <div className="button-row">
          {isAuthenticated ? (
            <>
              <Link className="primary-link" to="/dashboard">
                Go to Senior Dashboard
              </Link>
              <Link className="secondary-link" to="/caregiver">
                View Caregiver Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="primary-link" to="/auth/login">
                Log in
              </Link>
              <Link className="secondary-link" to="/auth/register">
                Create account
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default Home
