import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function AdminPage() {
  const [message, setMessage] = useState('loading...')

  useEffect(() => {
    api
      .get('/admin/ping')
      .then((res) => setMessage(res.data.message))
      .catch((err) => setMessage(`error ${err.response?.status}`))
  }, [])

  return (
    <div>
      <h1>Admin area</h1>
      <p>Backend says: {message}</p>
      <Link to="/">Back</Link>
    </div>
  )
}