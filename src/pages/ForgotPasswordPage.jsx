import { useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../api/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await publicApi.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>If an account exists for that address, we have sent a link to reset the password.</p>
        <Link to="/login">Back to login</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Forgot password</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <Link to="/login">Back to login</Link>
    </div>
  )
}