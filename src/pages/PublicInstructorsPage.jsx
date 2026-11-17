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

      {items && items.length > 0 && (
        <div className="instructor-list">
          {items.map((i) => (
            <article key={i.id} className="instructor-card">
              <Avatar name={i.fullName} url={i.avatarUrl} size={64} />
              <div className="instructor-card__details">
                <Link className="instructor-card__name" to={`/instructors/${i.id}`}>
                  {i.fullName}
                </Link>
                <div className="instructor-card__meta">{i.headline}</div>
                <div className="instructor-card__meta">{i.expertise}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}