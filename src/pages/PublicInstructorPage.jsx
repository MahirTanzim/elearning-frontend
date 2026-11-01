import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicApi } from '../api/client'
import Avatar from '../components/Avatar'

// Links are validated on the server too, but we never trust one blindly in an href
const safeHref = (url) => (/^https?:\/\//i.test(url) ? url : '#')

export default function PublicInstructorPage() {
  const { id } = useParams()
  const [instructor, setInstructor] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setInstructor(null)
    setError('')
    publicApi
      .get(`/public/instructors/${id}`)
      .then((res) => setInstructor(res.data))
      .catch((err) =>
        setError(err.response?.status === 404 ? 'This instructor was not found.' : 'Could not load the profile.')
      )
  }, [id])

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/instructors">All instructors</Link>
      </div>
    )
  }
  if (!instructor) return <p>Loading...</p>

  return (
    <div>
      <p>
        <Link to="/instructors">All instructors</Link>
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Avatar name={instructor.fullName} url={instructor.avatarUrl} size={120} />
        <div>
          <h1 style={{ margin: 0 }}>{instructor.fullName}</h1>
          <div>{instructor.headline}</div>
          <div>{instructor.expertise}</div>
        </div>
      </div>

      <h2>About</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{instructor.bio}</p>

      <h2>Qualifications</h2>
      {instructor.qualifications.length === 0 && <p>None listed.</p>}
      <ul>
        {instructor.qualifications.map((q, index) => (
          <li key={index}>
            <b>{q.title}</b>, {q.institution}
            {q.fieldOfStudy ? ` (${q.fieldOfStudy})` : ''} {q.startYear ?? ''}
            {q.startYear || q.endYear ? '-' : ''}
            {q.endYear ?? ''}
          </li>
        ))}
      </ul>

      {instructor.socialLinks.length > 0 && (
        <>
          <h2>Find them online</h2>
          <ul>
            {instructor.socialLinks.map((l) => (
              <li key={l.platform}>
                {l.platform}:{' '}
                <a href={safeHref(l.url)} target="_blank" rel="noopener noreferrer nofollow">
                  {l.url}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Ratings</h2>
      <p>Ratings and reviews will appear here once learners can take this instructor's courses.</p>
    </div>
  )
}