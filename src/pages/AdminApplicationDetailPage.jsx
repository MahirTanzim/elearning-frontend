import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import { downloadDocument } from '../api/download'

function errorText(err) {
  const data = err.response?.data
  if (data?.fieldErrors) return Object.values(data.fieldErrors).join(' ')
  return data?.message || 'Something went wrong. Please try again.'
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams()
  const [app, setApp] = useState(null)
  const [message, setMessage] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .get(`/admin/instructor-applications/${id}`)
      .then((res) => setApp(res.data))
      .catch((err) => setMessage({ ok: false, text: errorText(err) }))
  }, [id])

  async function run(action, successText) {
    setMessage(null)
    setBusy(true)
    try {
      const res = await action()
      setApp(res.data)
      if (successText) setMessage({ ok: true, text: successText })
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) })
    } finally {
      setBusy(false)
    }
  }

  const toggleVerified = (qualification) =>
    run(() => api.put(`/admin/qualifications/${qualification.id}/verified`, { verified: !qualification.verified }))

  const approve = () => {
    if (!window.confirm('Approve this application and give the user the INSTRUCTOR role?')) return
    run(() => api.post(`/admin/instructor-applications/${id}/approve`), 'Application approved.')
  }

  const reject = () => run(() => api.post(`/admin/instructor-applications/${id}/reject`, { reason }), 'Application rejected.')

  const download = async (doc) => {
    try {
      await downloadDocument(doc)
    } catch {
      setMessage({ ok: false, text: 'Could not download the file.' })
    }
  }

  if (!app) {
    return (
      <div>
        {message ? <p style={{ color: 'red' }}>{message.text}</p> : <p>Loading...</p>}
        <Link to="/admin/instructor-applications">Back to list</Link>
      </div>
    )
  }

  const pending = app.status === 'PENDING'

  return (
    <div>
      <h1>Review application</h1>
      <p>
        <Link to="/admin/instructor-applications">Back to list</Link>
      </p>

      {message && <p style={{ color: message.ok ? 'green' : 'red' }}>{message.text}</p>}

      <p>
        <b>Status:</b> {app.status}
      </p>
      {app.rejectionReason && <p>Rejection reason: {app.rejectionReason}</p>}

      <h2>Applicant</h2>
      <p>
        {app.user.fullName} ({app.user.email}) {app.user.emailVerified ? '[email verified]' : '[email NOT verified]'}
      </p>
      <p>
        <b>Headline:</b> {app.headline}
      </p>
      <p>
        <b>Expertise:</b> {app.expertise}
      </p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <b>Bio:</b> {app.bio}
      </p>

      <h2>Links</h2>
      {app.socialLinks.length === 0 && <p>None.</p>}
      <ul>
        {app.socialLinks.map((l) => (
          <li key={l.platform}>
            {l.platform}:{' '}
            <a href={l.url} target="_blank" rel="noopener noreferrer">
              {l.url}
            </a>
          </li>
        ))}
      </ul>

      <h2>Qualifications</h2>
      <p>Open each document and check it before ticking "Verified".</p>
      <ul>
        {app.qualifications.map((q) => (
          <li key={q.id}>
            <b>{q.type}</b>: {q.title}, {q.institution}
            {q.fieldOfStudy ? ` (${q.fieldOfStudy})` : ''} {q.startYear ?? ''}-{q.endYear ?? ''}
            <div>
              <label>
                <input type="checkbox" checked={q.verified} disabled={!pending || busy} onChange={() => toggleVerified(q)} />{' '}
                Verified
              </label>
            </div>
            <ul>
              {q.documents.length === 0 && <li>No documents uploaded</li>}
              {q.documents.map((d) => (
                <li key={d.id}>
                  {d.fileName} ({Math.max(1, Math.round(d.sizeBytes / 1024))} KB){' '}
                  <button onClick={() => download(d)}>Open</button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {pending ? (
        <>
          <h2>Decision</h2>
          <button onClick={approve} disabled={busy}>
            Approve
          </button>

          <h3>Or reject</h3>
          <textarea
            placeholder="Reason shown to the applicant (at least 10 characters)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            cols={50}
            maxLength={1000}
          />
          <div>
            <button onClick={reject} disabled={busy || reason.trim().length < 10}>
              Reject
            </button>
          </div>
        </>
      ) : (
        <p>This application is {app.status}. No further action is possible here.</p>
      )}
    </div>
  )
}