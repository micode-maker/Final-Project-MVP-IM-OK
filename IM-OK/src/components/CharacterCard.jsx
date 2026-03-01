function CharacterCard({
  checkedIn,
  onCheckIn,
  disabled = false,
  beforeImageSrc,
  afterImageSrc,
  children,
}) {
  const isButtonDisabled = disabled || checkedIn
  const activeImageSrc = checkedIn ? afterImageSrc : beforeImageSrc

  return (
    <section className="character-card-wrapper">
      <button
        className={`character-card${checkedIn ? ' is-checked-in' : ''}`}
        disabled={isButtonDisabled}
        onClick={onCheckIn}
        type="button"
      >
        <img
          alt={checkedIn ? 'Checked in character' : 'Pending check-in character'}
          className="character-image"
          src={activeImageSrc}
        />
        <span className="character-hint">
          {checkedIn ? 'You\'ve checked in for today.' : 'Tap to complete your daily check-in.'}
        </span>
      </button>
      {children ? <div className="character-extra">{children}</div> : null}
    </section>
  )
}

export default CharacterCard
