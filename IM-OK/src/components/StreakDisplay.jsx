const STREAK_WINDOW = 7

function StreakDisplay({ count, label = 'Current streak' }) {
  const filledCount = Math.max(0, Math.min(count, STREAK_WINDOW))
  const dots = Array.from({ length: STREAK_WINDOW }, (_, index) => index < filledCount)

  return (
    <section className="streak-display">
      <p className="streak-label">{label}</p>
      <p className="streak-count">{count}</p>

      <ul className="streak-dots" aria-hidden="true">
        {dots.map((isFilled, index) => (
          <li className={`streak-dot${isFilled ? ' is-filled' : ''}`} key={index} />
        ))}
      </ul>

      <p className="streak-caption">
        {count === 0
          ? 'Your first check-in starts the streak.'
          : `${filledCount} of the last ${STREAK_WINDOW} days.`}
      </p>
    </section>
  )
}

export default StreakDisplay
