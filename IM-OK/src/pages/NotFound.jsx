import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'

function NotFound() {
  return (
    <main className="page">
      <Header title="Page Not Found" subtitle="The route you entered does not exist." />
      <NavButtons />

      <section className="panel not-found-panel">
        <p>We couldn't find that page.</p>
        <Link className="primary-link" to="/">
          Return Home
        </Link>
      </section>
    </main>
  )
}

export default NotFound
