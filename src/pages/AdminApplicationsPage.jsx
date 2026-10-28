import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'


const status = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']

export default function AdminApplicationPage() {
    const [status, setStatus] = useState('PENDING')
    const [items, setItems] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        setItems(null)
        setError('')
        api
            .get('/admin/instructor-applications', { params: { status } })
            .then((res) => setItems(res.data))
            .catch(() => setError('Could not load applications.'))
    }, [status])
    return (
    <div>
      <h1>Instructor applications</h1>
      <p>
        <Link to="/admin">Back</Link>
      </p>

      <label>Show: </label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!items && !error && <p>Loading...</p>}
      {items && items.length === 0 && <p>Nothing here.</p>}
      {items && items.length > 0 && (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Headline</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.fullName}</td>
                <td>{a.email}</td>
                <td>{a.headline}</td>
                <td>{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : ''}</td>
                <td>
                  <Link to={`/admin/instructor-applications/${a.id}`}>Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

