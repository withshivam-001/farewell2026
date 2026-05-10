import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s for video uploads
})

// Helper to get token from zustand persisted storage
function getStoredAuth() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('farewell-auth')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed?.state || {}
  } catch {
    return {}
  }
}

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getStoredAuth()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — auto refresh token on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        }).catch(err => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const { refreshToken } = getStoredAuth()
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })

        // Update stored tokens
        const raw = localStorage.getItem('farewell-auth')
        if (raw) {
          const stored = JSON.parse(raw)
          if (stored.state) {
            stored.state.accessToken = data.accessToken
            stored.state.refreshToken = data.refreshToken
            localStorage.setItem('farewell-auth', JSON.stringify(stored))
          }
        }

        processQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        // Clear auth and redirect
        localStorage.removeItem('farewell-auth')
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
