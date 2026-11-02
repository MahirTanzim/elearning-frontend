import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { publicApi } from '../api/client'

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']
const LESSON_TYPES = ['VIDEO', 'PDF', 'TEXT']
const EMPTY_FORM = {
  title: '', subtitle: '', description: '', categoryId: '', level: 'BEGINNER',
  language: 'English', price: '0', whatYouLearn: '', requirements: '',
}

function errorText(err) {
  const data = err.response?.data
  if (data?.fieldErrors) return Object.values(data.fieldErrors).join(' ')
  return data?.message || 'Something went wrong. Please try again.'
}

function toForm(c) {
  return {
    title: c.title, subtitle: c.subtitle || '', description: c.description || '',
    categoryId: String(c.categoryId), level: c.level, language: c.language,
    price: String(c.price), whatYouLearn: c.whatYouLearn || '', requirements: c.requirements || '',
  }
}

// returns the ids with item `index` moved by `delta` (-1 up, +1 down), or null if impossible
function movedIds(list, index, delta) {
  const target = index + delta
  if (target < 0 || target >= list.length) return null
  const ids = list.map((x) => x.id)
  ;[ids[index], ids[target]] = [ids[target], ids[index]]
  return ids
}

function LessonRow({ lesson, index, count, locked, run, onMove }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(lesson.title)
  const [description, setDescription] = useState(lesson.description || '')
  const [textContent, setTextContent] = useState(lesson.textContent || '')
  const [freePreview, setFreePreview] = useState(lesson.freePreview)

  const save = async () => {
    const ok = await run(
      () => api.put(`/instructor/lessons/${lesson.id}`, { title, description, textContent, freePreview }),
      'Lesson saved.'
    )
    if (ok) setOpen(false)
  }

  const remove = () => {
    if (window.confirm(`Delete the lesson "${lesson.title}"?`)) {
      run(() => api.delete(`/instructor/lessons/${lesson.id}`))
    }
  }

  return (
    <li>
      [{lesson.type}] {lesson.title} {lesson.freePreview && <b>(free preview)</b>}{' '}
      {!locked && (
        <>
          <button disabled={index === 0} onClick={() => onMove(index, -1)}>Up</button>{' '}
          <button disabled={index === count - 1} onClick={() => onMove(index, 1)}>Down</button>{' '}
          <button onClick={() => setOpen(!open)}>{open ? 'Close' : 'Edit'}</button>{' '}
          <button onClick={remove}>Delete</button>
        </>
      )}
      {open && (
        <div style={{ marginLeft: 16 }}>
          <div>
            <label>Title </label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
          </div>
          <div>
            <label>Description </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={2000} />
          </div>
          {lesson.type === 'TEXT' && (
            <div>
              <label>Text content </label>
              <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} rows={8} cols={60} maxLength={20000} />
            </div>
          )}
          <label>
            <input type="checkbox" checked={freePreview} onChange={(e) => setFreePreview(e.target.checked)} /> Free preview
          </label>
          <div>
            <button onClick={save}>Save lesson</button>
          </div>
        </div>
      )}
    </li>
  )
}

function SectionBlock({ section, index, count, locked, run, onMove }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('VIDEO')
  const [freePreview, setFreePreview] = useState(false)

  const addLesson = async (e) => {
    e.preventDefault()
    const ok = await run(
      () => api.post(`/instructor/sections/${section.id}/lessons`, { title, type, freePreview }),
      'Lesson added.'
    )
    if (ok) {
      setTitle('')
      setFreePreview(false)
    }
  }

  const rename = () => {
    const newTitle = window.prompt('Section title', section.title)
    if (newTitle && newTitle.trim()) run(() => api.put(`/instructor/sections/${section.id}`, { title: newTitle }))
  }

  const remove = () => {
    if (window.confirm(`Delete the section "${section.title}" and all its lessons?`)) {
      run(() => api.delete(`/instructor/sections/${section.id}`))
    }
  }

  const moveLesson = (i, delta) => {
    const ids = movedIds(section.lessons, i, delta)
    if (ids) run(() => api.put(`/instructor/sections/${section.id}/lessons/order`, { ids }))
  }

  return (
    <div style={{ border: '1px solid #aaa', padding: 8, marginBottom: 12 }}>
      <h3>
        Section {index + 1}: {section.title}{' '}
        {!locked && (
          <>
            <button disabled={index === 0} onClick={() => onMove(index, -1)}>Up</button>{' '}
            <button disabled={index === count - 1} onClick={() => onMove(index, 1)}>Down</button>{' '}
            <button onClick={rename}>Rename</button>{' '}
            <button onClick={remove}>Delete</button>
          </>
        )}
      </h3>

      {section.lessons.length === 0 && <p>No lessons yet.</p>}
      <ol>
        {section.lessons.map((l, i) => (
          <LessonRow
            key={l.id}
            lesson={l}
            index={i}
            count={section.lessons.length}
            locked={locked}
            run={run}
            onMove={moveLesson}
          />
        ))}
      </ol>

      {!locked && (
        <form onSubmit={addLesson}>
          <input placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required />{' '}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {LESSON_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>{' '}
          <label>
            <input type="checkbox" checked={freePreview} onChange={(e) => setFreePreview(e.target.checked)} /> Free preview
          </label>{' '}
          <button type="submit">Add lesson</button>
        </form>
      )}
    </div>
  )
}

export default function CourseEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [categories, setCategories] = useState([])
  const [course, setCourse] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(!isNew)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [newSection, setNewSection] = useState('')

  useEffect(() => {
    publicApi.get('/public/categories').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    api
      .get(`/instructor/courses/${id}`)
      .then((res) => {
        setCourse(res.data)
        setForm(toForm(res.data))
      })
      .catch((err) => setMessage({ ok: false, text: errorText(err) }))
      .finally(() => setLoading(false))
  }, [id, isNew])

  // runs an API call that returns the whole course; shows a message; returns true on success
  async function run(action, successText) {
    setMessage(null)
    setBusy(true)
    try {
      const res = await action()
      setCourse(res.data)
      if (successText) setMessage({ ok: true, text: successText })
      return true
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) })
      return false
    } finally {
      setBusy(false)
    }
  }

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value })

  const saveDetails = async (e) => {
    e.preventDefault()
    setMessage(null)
    setBusy(true)
    const payload = { ...form, categoryId: Number(form.categoryId), price: Number(form.price) }
    try {
      if (isNew) {
        const res = await api.post('/instructor/courses', payload)
        navigate(`/instructor/courses/${res.data.id}`, { replace: true })
      } else {
        const res = await api.put(`/instructor/courses/${id}`, payload)
        setCourse(res.data)
        setMessage({ ok: true, text: 'Course details saved.' })
      }
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) })
    } finally {
      setBusy(false)
    }
  }

  const deleteCourse = async () => {
    if (!window.confirm('Delete this course and everything in it? This cannot be undone.')) return
    try {
      await api.delete(`/instructor/courses/${id}`)
      navigate('/instructor/courses', { replace: true })
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) })
    }
  }

  const addSection = async (e) => {
    e.preventDefault()
    const ok = await run(() => api.post(`/instructor/courses/${id}/sections`, { title: newSection }), 'Section added.')
    if (ok) setNewSection('')
  }

  const moveSection = (index, delta) => {
    const ids = movedIds(course.sections, index, delta)
    if (ids) run(() => api.put(`/instructor/courses/${id}/sections/order`, { ids }))
  }

  if (loading) return <p>Loading...</p>

  const locked = !isNew && course && !['DRAFT', 'REJECTED'].includes(course.status)

  return (
    <div>
      <h1>{isNew ? 'Create a course' : 'Edit course'}</h1>
      <p>
        <Link to="/instructor/courses">Back to my courses</Link>
      </p>

      {message && <p style={{ color: message.ok ? 'green' : 'red' }}>{message.text}</p>}

      {!isNew && course && (
        <p>
          <b>Status:</b> {course.status}
        </p>
      )}
      {!isNew && course?.status === 'REJECTED' && (
        <p style={{ color: 'red' }}>Rejected: {course.rejectionReason || 'no reason given'}</p>
      )}
      {locked && <p>This course cannot be edited while it is {course.status}.</p>}

      <h2>Details</h2>
      <form onSubmit={saveDetails}>
        <fieldset disabled={locked || busy} style={{ border: 'none', padding: 0 }}>
          <div>
            <label>Title </label>
            <input value={form.title} onChange={setField('title')} minLength={5} maxLength={120} required size={50} />
          </div>
          <div>
            <label>Subtitle </label>
            <input value={form.subtitle} onChange={setField('subtitle')} maxLength={200} size={50} />
          </div>
          <div>
            <label>Category </label>
            <select value={form.categoryId} onChange={setField('categoryId')} required>
              <option value="">Choose...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Level </label>
            <select value={form.level} onChange={setField('level')}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label>Language </label>
            <input value={form.language} onChange={setField('language')} maxLength={30} required />
          </div>
          <div>
            <label>Price (USD, 0 = free) </label>
            <input type="number" min="0" max="9999.99" step="0.01" value={form.price} onChange={setField('price')} required />
          </div>
          <div>
            <label>Description </label>
            <textarea value={form.description} onChange={setField('description')} rows={5} cols={60} maxLength={5000} />
          </div>
          <div>
            <label>What learners will learn (one per line) </label>
            <textarea value={form.whatYouLearn} onChange={setField('whatYouLearn')} rows={4} cols={60} maxLength={2000} />
          </div>
          <div>
            <label>Requirements (one per line) </label>
            <textarea value={form.requirements} onChange={setField('requirements')} rows={3} cols={60} maxLength={2000} />
          </div>
          <button type="submit">{isNew ? 'Create course' : 'Save details'}</button>
        </fieldset>
      </form>

      {!isNew && course && (
        <>
          <h2>Curriculum</h2>
          {course.sections.length === 0 && <p>No sections yet. Add the first one below.</p>}
          {course.sections.map((s, i) => (
            <SectionBlock
              key={s.id}
              section={s}
              index={i}
              count={course.sections.length}
              locked={locked}
              run={run}
              onMove={moveSection}
            />
          ))}

          {!locked && (
            <form onSubmit={addSection}>
              <input placeholder="New section title" value={newSection} onChange={(e) => setNewSection(e.target.value)} maxLength={150} required />{' '}
              <button type="submit" disabled={busy}>Add section</button>
            </form>
          )}

          <p>Video, PDF and file uploads for lessons come in the next slice.</p>

          {!locked && (
            <p>
              <button onClick={deleteCourse}>Delete this course</button>
            </p>
          )}
        </>
      )}
    </div>
  )
}