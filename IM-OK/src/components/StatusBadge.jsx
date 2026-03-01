function StatusBadge({
  checkedIn,
  checkedInText = 'Checked in for today',
  pendingText = "Waiting for today's check-in",
}) {
  return (
    <span className={`status-badge${checkedIn ? ' status-checked' : ' status-pending'}`} role="status">
      {checkedIn ? checkedInText : pendingText}
    </span>
  )
}

export default StatusBadge
