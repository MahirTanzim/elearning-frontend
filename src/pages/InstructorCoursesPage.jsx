import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function InstructorCoursesPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/instructor/courses')
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load your courses.'))
  }, [])

  return (
    <div>
      <h1>My courses</h1>
      <p>
        <Link to="/">Home</Link> | <Link to="/instructor/courses/new">Create a new course</Link>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!items && !error && <p>Loading...</p>}
      {items && items.length === 0 && <p>You have no courses yet.</p>}
      {items && items.length > 0 && (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Last changed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.categoryName}</td>
                <td>
                  {Number(c.price) === 0 ? 'Free' : `${c.price} ${c.currency}`}
                </td>
                <td>{c.status}</td>
                <td>{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</td>
                <td>
                  <Link to={`/instructor/courses/${c.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}