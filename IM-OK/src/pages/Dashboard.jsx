import { useEffect, useState } from 'react'
import CharacterCard from '../components/CharacterCard.jsx'
import Header from '../components/Header.jsx'
import NavButtons from '../components/NavButtons.jsx'
import QuoteCard from '../components/QuoteCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import StreakDisplay from '../components/StreakDisplay.jsx'
import { useCheckIn } from '../contexts/useCheckIn.js'
import { fetchMotivationalQuote } from '../utilities/fetchQuote.js'

const BEFORE_CHECKIN_IMAGE = '/character-before.png'
const AFTER_CHECKIN_IMAGE = '/character-after.png'

function Dashboard() {
  const [quote, setQuote] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { checkInStatus, streakCount, markCheckedIn } = useCheckIn()

  useEffect(() => {
    if (!checkInStatus) {
      return
    }

    let isCancelled = false

    setLoading(true)
    setError('')

    const loadQuote = async () => {
      try {
        const fetchedQuote = await fetchMotivationalQuote()
        if (!isCancelled) {
          setQuote(fetchedQuote.quote)
          setAuthor(fetchedQuote.author)
        }
      } catch (caughtError) {
        if (!isCancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Something went wrong while loading your quote.',
          )
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadQuote()

    return () => {
      isCancelled = true
    }
  }, [checkInStatus])

  const handleCheckIn = () => {
    if (loading || checkInStatus) {
      return
    }

    markCheckedIn()
  }

  return (
    <main className="page">
      <Header
        title="Senior Dashboard"
        subtitle="Check in daily to receive your motivational quote and keep your streak going!"
      />
      <NavButtons />

      <section className="dashboard-grid">
        <CharacterCard
          checkedIn={checkInStatus}
          disabled={loading}
          onCheckIn={handleCheckIn}
          beforeImageSrc={BEFORE_CHECKIN_IMAGE}
          afterImageSrc={AFTER_CHECKIN_IMAGE}
        >
          <StatusBadge checkedIn={checkInStatus} />
        </CharacterCard>

        <div className="dashboard-sidebar">
          <StreakDisplay count={streakCount} label="Daily streak" />
          <QuoteCard author={author} error={error} loading={loading} quote={quote} />
        </div>
      </section>
    </main>
  )
}

export default Dashboard
