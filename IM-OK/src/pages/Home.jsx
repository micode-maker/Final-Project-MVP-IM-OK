import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'

function Home() {
  return (
    <main className="page home-page">
      <Header title="Welcome" />
      <NavButtons />

      <section className="panel">
        <h2>How it works</h2>
        <p>
          Tap your character once each day to confirm you are okay. Caregivers can quickly review
          status and streak progress.
        </p>
        <div className="button-row">
          <Link className="primary-link" to="/dashboard">
            Go to Senior Dashboard
          </Link>
          <Link className="secondary-link" to="/caregiver">
            View Caregiver Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Home
