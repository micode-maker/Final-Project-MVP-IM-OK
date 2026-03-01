import { useCallback, useMemo, useReducer } from 'react'
import { CheckInContext } from './checkInContext.js'

const initialCheckInState = {
  checkInStatus: false,
  streakCount: 0,
}

function checkInReducer(state, action) {
  switch (action.type) {
    case 'MARK_CHECKED_IN': {
      if (state.checkInStatus) {
        return state
      }

      return {
        ...state,
        checkInStatus: true,
        streakCount: state.streakCount + 1,
      }
    }
    default:
      return state
  }
}

export function CheckInProvider({ children }) {
  const [state, dispatch] = useReducer(checkInReducer, initialCheckInState)

  const markCheckedIn = useCallback(() => {
    dispatch({ type: 'MARK_CHECKED_IN' })
  }, [])

  const contextValue = useMemo(
    () => ({
      checkInStatus: state.checkInStatus,
      streakCount: state.streakCount,
      markCheckedIn,
    }),
    [state.checkInStatus, state.streakCount, markCheckedIn],
  )

  return <CheckInContext.Provider value={contextValue}>{children}</CheckInContext.Provider>
}
