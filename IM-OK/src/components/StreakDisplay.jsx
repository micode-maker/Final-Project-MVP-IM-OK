function StreakDisplay({ count, label = 'Current streak' }) {
  return (
    <section className="streak-display">
      <p className="streak-label">{label}</p>
      <p className="streak-count">{count}</p>
    </section>
  )
}

export default StreakDisplay
