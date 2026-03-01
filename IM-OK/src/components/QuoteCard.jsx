function QuoteCard({ quote, author, loading, error }) {
  let content = (
    <p className="quote-feedback">Complete a check-in to load your motivational quote.</p>
  )

  if (loading) {
    content = <p className="quote-feedback">Loading quote...</p>
  } else if (error) {
    content = <p className="quote-feedback quote-error">{error}</p>
  } else if (quote) {
    content = (
      <>
        <blockquote className="quote-text">"{quote}"</blockquote>
        <p className="quote-author">- {author}</p>
      </>
    )
  }

  return (
    <section className="quote-card" aria-live="polite">
      <p className="quote-label">Daily Motivation</p>
      {content}
    </section>
  )
}

export default QuoteCard
