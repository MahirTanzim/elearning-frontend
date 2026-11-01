import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../api/client'
import Avatar from '../components/Avatar'

export default function PublicInstructorsPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    publicApi
      .get('/public/instructors')
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load instructors.'))
  }, [])

  return (
    <div>
      <h1>Our instructors</h1>
      <p>
        <Link to="/">Home</Link>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!items && !error && <p>Loading...</p>}
      {items && items.length === 0 && <p>No instructors yet.</p>}

      {items &&
        items.map((i) => (
          <div key={i.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <Avatar name={i.fullName} url={i.avatarUrl} size={64} />
            <div>
              <Link to={`/instructors/${i.id}`}>
                <b>{i.fullName}</b>
              </Link>
              <div>{i.headline}</div>
              <div>{i.expertise}</div>
            </div>
          </div>
        ))}
    </div>
  )
}