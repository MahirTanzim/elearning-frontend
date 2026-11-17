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
    <div className="home-page">
      <section className="home-hero">
        <p className="home-hero__eyebrow">A better way to learn</p>
        <h1>Learn from people who love to teach.</h1>
        <p className="home-hero__intro">
          Find experienced instructors and take the next step toward your goals.
        </p>
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
          <div className="home-actions">
            <Link className="home-primary-link" to="/instructors">Browse instructors</Link>
            <Link to="/profile">My profile</Link>
            {user.roles.includes('ADMIN') && (
              <>
                <Link to="/admin">Admin</Link>
              </>
            )}
            {!user.roles.includes('INSTRUCTOR') && (
              <>
                <Link to="/become-instructor">Become an instructor</Link>
              </>
            )}
            {user.roles.includes('INSTRUCTOR') && (
              <>
                <Link to="/instructor/courses">My courses</Link>
              </>
            )}
          </div>
          <p><button onClick={logout}>Log out</button></p>
        </>
      ) : (
        <div className="home-actions">
          <Link className="home-primary-link" to="/instructors">Browse instructors</Link>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create an account</Link>
        </div>
      )}
      </section>
    </div>
  )
}