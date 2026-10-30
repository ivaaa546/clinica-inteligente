import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentSession, login as loginRequest, logout as logoutRequest } from '../api/auth.js'
import { ApiError, setUnauthorizedHandler } from '../shared/api/client'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('checking')

  const invalidateSession = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
  }, [])

  const refreshSession = useCallback(async ({ showChecking = true } = {}) => {
    if (showChecking) {
      setStatus('checking')
    }

    try {
      const currentUser = await getCurrentSession()
      setUser(currentUser)
      setStatus('authenticated')
      return currentUser
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        invalidateSession()
        return null
      }

      setUser(null)
      setStatus('error')
      throw error
    }
  }, [invalidateSession])

  useEffect(() => setUnauthorizedHandler(invalidateSession), [invalidateSession])

  useEffect(() => {
    void Promise.resolve().then(() => refreshSession({ showChecking: false })).catch(() => {})
  }, [refreshSession])

  const login = useCallback(async (credentials) => {
    const authenticatedUser = await loginRequest(credentials)
    setUser(authenticatedUser)
    setStatus('authenticated')
    return authenticatedUser
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    invalidateSession()
  }, [invalidateSession])

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === 'authenticated',
    login,
    logout,
    refreshSession,
  }), [login, logout, refreshSession, status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
