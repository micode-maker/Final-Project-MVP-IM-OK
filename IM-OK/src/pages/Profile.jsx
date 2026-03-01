import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useCheckIn } from '../contexts/useCheckIn.js'

const profileSections = {
  overview: {
    title: 'Senior Profile',
    lines: ['Name: Demo Senior', 'Preferred check-in: Morning', 'Caregiver contact: Demo Caregiver'],
  },
  preferences: {
    title: 'Check-In Preferences',
    lines: ['Daily reminder: Enabled', 'Reminder time: 9:00 AM', 'Quote categories: Motivation + Wisdom'],
  },
  caregiver: {
    title: 'Caregiver Contact',
    lines: ['Primary caregiver: Demo Caregiver', 'Phone: (000) 000-0000', 'Relation: Family'],
  },
}

function Profile() {
  const { checkInStatus } = useCheckIn()
  const { section = 'overview' } = useParams()
  const activeSection = profileSections[section] ?? profileSections.overview

  return (
    <main className="page">
      <Header title="Profile" subtitle="Simple profile details for this MVP." />
      <NavButtons />

      <section className="panel">
        <div className="profile-links" aria-label="Profile sections">
          <Link className={`pill-link${section === 'overview' || !profileSections[section] ? ' is-active' : ''}`} to="/profile/overview">
            Overview
          </Link>
          <Link className={`pill-link${section === 'preferences' ? ' is-active' : ''}`} to="/profile/preferences">
            Preferences
          </Link>
          <Link className={`pill-link${section === 'caregiver' ? ' is-active' : ''}`} to="/profile/caregiver">
            Caregiver
          </Link>
        </div>

        <h2>{activeSection.title}</h2>
        <ul className="profile-list">
          {activeSection.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <StatusBadge
          checkedIn={checkInStatus}
          checkedInText="Status: Checked in"
          pendingText="Status: Not checked in"
        />
      </section>
    </main>
  )
}

export default Profile
