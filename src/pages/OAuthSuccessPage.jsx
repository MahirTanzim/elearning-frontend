import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function OAuthSuccessPage() {
  const { completeOAuthLogin } = useAuth()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return // React dev mode runs effects twice
    handled.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    // Remove the tokens from the address bar right away
    window.history.replaceState(null, '', window.location.pathname)

    if (accessToken && refreshToken) {
      completeOAuthLogin(accessToken, refreshToken).then(() => navigate('/', { replace: true }))
    } else {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [])

  return <p>Signing you in...</p>
}