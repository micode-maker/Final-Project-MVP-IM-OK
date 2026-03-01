import { useContext } from 'react'
import { CheckInContext } from './checkInContext.js'

export function useCheckIn() {
  const context = useContext(CheckInContext)

  if (!context) {
    throw new Error('useCheckIn must be used inside a CheckInProvider.')
  }

  return context
}
