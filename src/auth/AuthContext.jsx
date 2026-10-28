import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { publicApi, tokenStore } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const loadUser = useCallback(async () => {
        if (!tokenStore.getAccess() && !tokenStore.getRefresh()) {
            setUser(null)
            setLoading(false)
            return
        }
        try {
            const res = await api.get('/me')
            setUser(res.data)
        } catch {
            tokenStore.clear()
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadUser()
    }, [loadUser])

    const login = async (email, password) => {
        const res = await publicApi.post('/auth/login', { email, password })
        tokenStore.set(res.data.accessToken, res.data.refreshToken)
        setUser(res.data.user)
    }

    const register = async (fullName, email, password) => {
        await publicApi.post('/auth/register', { fullName, email, password })
        await login(email, password)
    }

    const logout = async () => {
        const refreshToken = tokenStore.getRefresh()
        if (refreshToken) {
            try {
                await publicApi.post('/auth/logout', { refreshToken })
            } catch {
                // even if the server call fails, we still log out locally
            }
        }
        tokenStore.clear()
        setUser(null)
    }

    const completeOAuthLogin = async (accessToken, refreshToken) => {
        tokenStore.set(accessToken, refreshToken)
        setLoading(true)
        await loadUser()
    }
    // Gets a fresh access token, which includes any roles granted since login
    const refreshSession = async () => {
        const res = await publicApi.post('/auth/refresh', { refreshToken: tokenStore.getRefresh() })
        tokenStore.set(res.data.accessToken, res.data.refreshToken)
        setUser(res.data.user)
    }
  const value = { user, loading, login, register, logout, completeOAuthLogin, reloadUser: loadUser, refreshSession }    
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)