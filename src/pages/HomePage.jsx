import { useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuth()
  const [resendMessage, setResendMessage] = useState('')

  const resend = async () => {
    try {
      await publicApi.post('/auth/resend-verification', { email: user.email })
      setResendMessage('If a new link was needed, it has been sent. Please wait a minute between requests.')
    } catch {
      setResendMessage('Could not send. Please try again later.')
    }
  }

  return (
    <div>
      <h1>E-Learning Platform</h1>
      {user ? (
        <>
          {!user.emailVerified && (
            <div style={{ background: '#fff3cd', padding: 8, marginBottom: 12 }}>
              Please verify your email address. Check your inbox.{' '}
              <button onClick={resend}>Resend link</button>
              {resendMessage && <div>{resendMessage}</div>}
            </div>
          )}
          <p>
            Welcome, {user.fullName} ({user.roles.join(', ')})
          </p>
          <p>
            <Link to="/profile">My profile</Link>
            {user.roles.includes('ADMIN') && (
              <>
                {' | '}
                <Link to="/admin">Admin</Link>
              </>
            )}
              {!user.roles.includes('INSTRUCTOR') && (
              <>
                {' | '}
                <Link to="/become-instructor">Become an instructor</Link>
              </>
            )}
          </p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </p>
      )}
    </div>
  )
}