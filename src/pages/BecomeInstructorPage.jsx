import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'

const QUAL_TYPES = ['DEGREE', 'CERTIFICATION', 'EXPERIENCE']
const PLATFORMS = ['LINKEDIN', 'GITHUB', 'FACEBOOK', 'INSTAGRAM', 'PINTEREST', 'X', 'YOUTUBE', 'WEBSITE', 'OTHER']
const EMPTY_QUAL = { title: '', institution: '', fieldOfStudy: '', startYear: '', endYear: '', type: 'DEGREE' }

function errorText(err) {
  const data = err.response?.data
  if (data?.fieldErrors) return Object.values(data.fieldErrors).join(' ')
  return data?.message || 'Something went wrong. Please try again.'
}

export default function BecomeInstructorPage() {
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const { user, refreshSession } = useAuth()
  const activate = async () => {
    try {
      await refreshSession()
      setMessage({ ok: true, text: 'Instructor access activated.' })
    }
    catch {
      setMessage({ ok: false, text: "Could not refreash your session. Please Login again." })
    }
  }

  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [expertise, setExpertise] = useState('')
  const [links, setLinks] = useState([])
  const [qual, setQual] = useState(EMPTY_QUAL)

  useEffect(() => {
    api
      .get('/instructor-application')
      .then((res) => {
        const data = res.data
        setApp(data)
        setHeadline(data.headline || '')
        setBio(data.bio || '')
        setExpertise(data.expertise || '')
        setLinks(data.socialLinks.map((l) => ({ platform: l.platform, url: l.url })))
      })
      .catch((err) => {
        if (err.response?.status !== 404) setMessage({ ok: false, text: errorText(err) })
      })
      .finally(() => setLoading(false))
  }, [])

  // runs an API call, stores the returned application, shows a message; returns true on success
  async function run(action, successText) {
    setMessage(null)
    try {
      const res = await action()
      setApp(res.data)
      if (successText) setMessage({ ok: true, text: successText })
      return true
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) })
      return false
    }
  }

  const saveProfile = () =>
    run(() => api.put('/instructor-application', { headline, bio, expertise }), 'Profile saved.')

  const addQualification = async (e) => {
    e.preventDefault()
    const ok = await run(
      () =>
        api.post('/instructor-application/qualifications', {
          ...qual,
          startYear: qual.startYear ? Number(qual.startYear) : null,
          endYear: qual.endYear ? Number(qual.endYear) : null,
        }),
      'Qualification added.'
    )
    if (ok) setQual(EMPTY_QUAL)
  }

  const deleteQualification = (id) => run(() => api.delete(`/instructor-application/qualifications/${id}`))
  const uploadDocument = (qualificationId, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ ok: false, text: 'File is too large (max 5 MB).' })
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    return run(
      () => api.post(`/instructor-application/qualifications/${qualificationId}/documents`, formData),
      'Document uploaded.'
    )
  }

  const deleteDocument = (documentId) => run(() => api.delete(`/instructor-application/documents/${documentId}`))

  // A plain <a href> cannot send the Authorization header, so we fetch the file with
  // axios (which does) and turn the response into a temporary download link.
  const downloadDocument = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc.id}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setMessage({ ok: false, text: 'Could not download the file.' })
    }
  }

  const saveLinks = () =>
    run(
      () => api.put('/instructor-application/social-links', { links: links.filter((l) => l.url.trim()) }),
      'Links saved.'
    )

  const submit = () =>
    run(() => api.post('/instructor-application/submit'), 'Application submitted. An admin will review it.')

  if (loading) return <p>Loading...</p>

  const status = app?.status ?? 'NOT_STARTED'
  const profileLocked = status === 'PENDING' || status === 'SUSPENDED'
  const qualsLocked = !['NOT_STARTED', 'DRAFT', 'REJECTED'].includes(status)
  const canSubmit = ['DRAFT', 'REJECTED'].includes(status)

  return (
    <div>
      <h1>Become an instructor</h1>
      <p>
        <Link to="/">Back</Link>
      </p>

      {message && <p style={{ color: message.ok ? 'green' : 'red' }}>{message.text}</p>}

      <p>
        <b>Status:</b> {status}
      </p>
      {status === 'PENDING' && <p>Your application is under review. You cannot edit it until a decision is made.</p>}
      {status === 'REJECTED' && (
        <p style={{ color: 'red' }}>
          Your application was rejected: {app.rejectionReason || 'no reason given'}. Fix the problems and submit again.
        </p>
      )}
      {status === 'APPROVED' && (
        <p>
          You are approved!{' '}
          {user && !user.roles.includes('INSTRUCTOR') && (
            <buton onClick= {activate}>Activate instructo access</buton>
          )}
          {user && user.roles.includes('INSTRUCTOR') && <b>Your instructor access is active</b>}
        </p>
      )}
      {status === 'SUSPENDED' && <p style={{ color: 'red' }}>Your instructor account is suspended.</p>}

      <h2>1. About you</h2>
      <div>
        <label>Headline </label>
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} disabled={profileLocked} maxLength={150} />
      </div>
      <div>
        <label>Bio </label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={profileLocked} maxLength={2000} rows={5} />
      </div>
      <div>
        <label>Expertise </label>
        <input value={expertise} onChange={(e) => setExpertise(e.target.value)} disabled={profileLocked} maxLength={255} />
      </div>
      <button onClick={saveProfile} disabled={profileLocked}>
        Save profile
      </button>

      <h2>2. Qualifications</h2>
      <ul>
        {(app?.qualifications ?? []).map((q) => (
          <li key={q.id}>
            {q.type}: {q.title}, {q.institution}
            {q.fieldOfStudy ? ` (${q.fieldOfStudy})` : ''} {q.startYear ?? ''}-{q.endYear ?? ''}{' '}
            {q.verified && <b>[verified]</b>}{' '}
            {!qualsLocked && <button onClick={() => deleteQualification(q.id)}>Delete</button>}
            <ul>
              {q.documents.map((d) => (
                <li key={d.id}>
                  {d.fileName} ({Math.max(1, Math.round(d.sizeBytes / 1024))} KB){' '}
                  <button onClick={() => downloadDocument(d)}>Download</button>{' '}
                  {!qualsLocked && <button onClick={() => deleteDocument(d.id)}>Delete</button>}
                </li>
              ))}
            </ul>
            {!qualsLocked && q.documents.length < 3 && (
              <div>
                Proof document (PDF, PNG or JPG, max 5 MB):{' '}
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    uploadDocument(q.id, e.target.files[0])
                    e.target.value = ''
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      {!qualsLocked && (
        <form onSubmit={addQualification}>
          <select value={qual.type} onChange={(e) => setQual({ ...qual, type: e.target.value })}>
            {QUAL_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>{' '}
          <input placeholder="Title" value={qual.title} onChange={(e) => setQual({ ...qual, title: e.target.value })} required />{' '}
          <input placeholder="Institution" value={qual.institution} onChange={(e) => setQual({ ...qual, institution: e.target.value })} required />{' '}
          <input placeholder="Field of study" value={qual.fieldOfStudy} onChange={(e) => setQual({ ...qual, fieldOfStudy: e.target.value })} />{' '}
          <input placeholder="Start year" type="number" value={qual.startYear} onChange={(e) => setQual({ ...qual, startYear: e.target.value })} />{' '}
          <input placeholder="End year" type="number" value={qual.endYear} onChange={(e) => setQual({ ...qual, endYear: e.target.value })} />{' '}
          <button type="submit">Add</button>
        </form>
      )}
      {qualsLocked && <p>Qualifications are locked while the application is {status}.</p>}

      <h2>3. Social and professional links</h2>
      {links.map((l, i) => (
        <div key={i}>
          <select
            value={l.platform}
            disabled={profileLocked}
            onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, platform: e.target.value } : x)))}
          >
            {PLATFORMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>{' '}
          <input
            placeholder="https://..."
            value={l.url}
            disabled={profileLocked}
            onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
          />{' '}
          <button disabled={profileLocked} onClick={() => setLinks(links.filter((_, j) => j !== i))}>
            Remove
          </button>
        </div>
      ))}
      <button disabled={profileLocked || links.length >= 10} onClick={() => setLinks([...links, { platform: 'LINKEDIN', url: '' }])}>
        Add link
      </button>{' '}
      <button disabled={profileLocked} onClick={saveLinks}>
        Save links
      </button>

      <h2>4. Submit</h2>
      <p>Save your profile and links first. Then submit for admin review.</p>
      <button onClick={submit} disabled={!canSubmit}>
        Submit application
      </button>
    </div>
  )
}