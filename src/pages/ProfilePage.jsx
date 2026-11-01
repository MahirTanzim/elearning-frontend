import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Avatar from '../components/Avatar'

function errorText(err) {
  const data = err.response?.data
  if (data?.fieldErrors) return Object.values(data.fieldErrors).join(' ')
  return data?.message || 'Something went wrong. Please try again.'
}

export default function ProfilePage() {
  const { user, reloadUser } = useAuth()
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  const upload = async (file) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ ok: false, text: 'Image is too large (max 2 MB).' })
      return
    }
    const formData = new FormData()
    formData.append('file', file)

    setBusy(true)
    setMessage(null)
    try {
      await api.post('/me/avatar', formData)
      await reloadUser()
      setMessage({ ok: true, text: 'Photo updated.' })
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await api.delete('/me/avatar')
      await reloadUser()
      setMessage({ ok: true, text: 'Photo removed.' })
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1>My profile</h1>
      <Avatar name={user.fullName} url={user.avatarUrl} size={100} />

      {message && <p style={{ color: message.ok ? 'green' : 'red' }}>{message.text}</p>}

      <div>
        Photo (PNG or JPG, max 2 MB):{' '}
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          disabled={busy}
          onChange={(e) => {
            upload(e.target.files[0])
            e.target.value = ''
          }}
        />{' '}
        <button onClick={remove} disabled={busy}>
          Remove photo
        </button>
      </div>

      <p>Name: {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(', ')}</p>
      <Link to="/">Back</Link>
    </div>
  )
}