import { Link } from 'react-router-dom'

export default function AdminPage() {
  return (
    <div>
      <h1>Admin area</h1>
      <ul>
        <li>
          <Link to="/admin/instructor-applications">Instructor applications</Link>
        </li>
      </ul>
      <Link to="/">Back</Link>
    </div>
  )
}