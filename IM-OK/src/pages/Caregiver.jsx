import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import StreakDisplay from '../components/StreakDisplay.jsx'
import { useCheckIn } from '../contexts/useCheckIn.js'

function Caregiver() {
  const { checkInStatus, streakCount } = useCheckIn()

  return (
    <main className="page">
      <Header
        title="Caregiver Dashboard"
        subtitle="Monitor your seniors check-in status here."
      />
      <NavButtons />

      <section className="panel caregiver-panel">
        <h2>Today's status</h2>
        <StatusBadge
          checkedIn={checkInStatus}
          checkedInText="Senior has checked in today"
          pendingText="No check-in recorded yet today"
        />
      </section>

      <StreakDisplay count={streakCount} label="Senior streak" />
    </main>
  )
}

export default Caregiver
