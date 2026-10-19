import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { publicApi } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { reloadUser } = useAuth()
  const [status, setStatus] = useState('verifying')
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return // React dev mode runs effects twice; the token works only once
    handled.current = true

    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      return
    }

    publicApi
      .post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success')
        reloadUser()
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div>
      <h1>Email verification</h1>
      {status === 'verifying' && <p>Verifying...</p>}
      {status === 'success' && <p>Your email is verified. Thank you!</p>}
      {status === 'error' && <p style={{ color: 'red' }}>This link is invalid, expired or was already used.</p>}
      <Link to="/">Go to home</Link>
    </div>
  )
}