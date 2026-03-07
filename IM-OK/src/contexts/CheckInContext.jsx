import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { useAuth } from './AuthContext.jsx'
import { CheckInContext } from './checkInContext.js'

const defaultCheckInState = {
  checkInStatus: false,
  streakCount: 0,
  lastCheckInDate: null,
  ownerUserId: null,
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function getStorageKey(userId) {
  return `im-ok-checkin-${userId}`
}

function sanitizeStoredState(storedState, userId) {
  if (!storedState || typeof storedState !== 'object') {
    return {
      ...defaultCheckInState,
      ownerUserId: userId,
    }
  }

  const streakCount =
    Number.isFinite(storedState.streakCount) && storedState.streakCount >= 0
      ? storedState.streakCount
      : 0
  const lastCheckInDate =
    typeof storedState.lastCheckInDate === 'string' ? storedState.lastCheckInDate : null

  return {
    checkInStatus: lastCheckInDate === getTodayDate(),
    streakCount,
    lastCheckInDate,
    ownerUserId: userId,
  }
}

function loadStoredCheckInState(userId) {
  if (!userId) {
    return defaultCheckInState
  }

  try {
    const rawState = window.localStorage.getItem(getStorageKey(userId))

    if (!rawState) {
      return {
        ...defaultCheckInState,
        ownerUserId: userId,
      }
    }

    return sanitizeStoredState(JSON.parse(rawState), userId)
  } catch {
    return {
      ...defaultCheckInState,
      ownerUserId: userId,
    }
  }
}

function checkInReducer(state, action) {
  switch (action.type) {
    case 'LOAD_USER_STATE':
      return action.payload
    case 'MARK_CHECKED_IN': {
      const today = getTodayDate()
      const alreadyCheckedInToday = state.checkInStatus && state.lastCheckInDate === today

      if (alreadyCheckedInToday) {
        return state
      }

      return {
        ...state,
        checkInStatus: true,
        streakCount: state.streakCount + 1,
        lastCheckInDate: today,
      }
    }
    default:
      return state
  }
}

export function CheckInProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(checkInReducer, defaultCheckInState)

  useEffect(() => {
    if (!user?.id) {
      dispatch({ type: 'LOAD_USER_STATE', payload: defaultCheckInState })
      return
    }

    const userState = loadStoredCheckInState(user.id)
    dispatch({
      type: 'LOAD_USER_STATE',
      payload: userState,
    })
  }, [user?.id])

  useEffect(() => {
    if (!user?.id || state.ownerUserId !== user.id) {
      return
    }

    window.localStorage.setItem(getStorageKey(user.id), JSON.stringify(state))
  }, [state, user?.id])

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
