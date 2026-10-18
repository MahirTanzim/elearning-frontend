import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>E-Learning Platform</h1>
      {user ? (
        <>
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