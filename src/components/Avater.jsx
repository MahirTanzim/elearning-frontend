import { useState } from 'react'

export default function Avatar({ name, url, size = 80 }) {
  const [failed, setFailed] = useState(false)

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }

  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size / 3,
      }}
    >
      {initials}
    </div>
  )
}