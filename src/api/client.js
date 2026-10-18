import axios from 'axios'

export const tokenStore = {
  getAccess: () => localStorage.getItem('accessToken'),
  getRefresh: () => localStorage.getItem('refreshToken'),
  set: (access, refresh) => {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  },
  clear: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}

// No interceptors: used for login, register, logout and refresh itself 
export const publicApi = axios.create({ baseURL: '/api' })

// Used for everything that needs a logged-in user
const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry && tokenStore.getRefresh()) {
      original._retry = true
      try {
        // If several calls fail at once, they all share ONE refresh request
        if (!refreshPromise) {
          refreshPromise = publicApi
            .post('/auth/refresh', { refreshToken: tokenStore.getRefresh() })
            .then((res) => {
              tokenStore.set(res.data.accessToken, res.data.refreshToken)
              return res.data.accessToken
            })
            .finally(() => {
              refreshPromise = null
            })
        }
        const newAccessToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return api(original)
      } catch (refreshError) {
        tokenStore.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api