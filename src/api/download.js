import api from './client'

// A plain <a href> cannot send the Authorization header, so we fetch the file with axios.
export async function downloadDocument(doc) {
  const res = await api.get(`/documents/${doc.id}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = doc.fileName
  a.click()
  URL.revokeObjectURL(url)
}