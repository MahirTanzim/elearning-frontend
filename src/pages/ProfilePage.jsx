import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div>
      <h1>My profile</h1>
      <p>Name: {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(', ')}</p>
      <Link to="/">Back</Link>
    </div>
  )
}