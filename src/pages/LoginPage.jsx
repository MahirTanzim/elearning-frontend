import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const urlErrors = {
    oauth_failed: 'Google login failed. Please try again.',
    email_not_verified: 'Your Google email is not verified.',
    account_not_active: 'This account is not active.',
}

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(urlErrors[searchParams.get('error')] || '')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            const status = err.response?.status
            if (status === 401) setError('Invalid email or password.')
            else if (status === 403) setError('This account is not active.')
            else setError('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p>or</p>
            <a href="http://localhost:8080/oauth2/authorization/google">Continue with Google</a>
            <p>
                <Link to="/forgot-password">Forgot password?</Link>
            </p>

            <p>
                No account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}