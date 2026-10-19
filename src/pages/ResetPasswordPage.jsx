import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { publicApi } from '../api/client'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await publicApi.post('/auth/reset-password', { token, newPassword: password })
      setDone(true)
    } catch (err) {
      if (err.response?.status === 400) {
        setError('This link is invalid or expired, or the password is too short (8-72 characters).')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div>
        <p>Missing reset token.</p>
        <Link to="/forgot-password">Request a new link</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div>
        <h1>Password changed</h1>
        <p>You can now log in with your new password.</p>
        <Link to="/login">Go to login</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Choose a new password</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>New password </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={72}
            required
          />
        </div>
        <div>
          <label>Repeat password </label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Change password'}
        </button>
      </form>
      <p>
        <Link to="/forgot-password">Request a new link</Link>
      </p>
    </div>
  )
}