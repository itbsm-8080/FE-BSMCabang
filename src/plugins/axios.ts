// plugins/axios.ts
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const api = axios.create({
        baseURL: config.public.apiBaseUrl,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })

    let isRefreshing = false
    let failedQueue: any[] = []

    // Process queue setelah token di-refresh
    const processQueue = (error: any, token: string | null = null) => {
        failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error)
            } else {
                prom.resolve(token)
            }
        })
        failedQueue = []
    }

    // Request interceptor
    api.interceptors.request.use(
        (request) => {
            const authStore = useAuthStore()

            if (authStore.cabangDatabase) {
                request.headers['X-Cabang-Database'] = authStore.cabangDatabase
            }
            if (authStore.cabangKode) {
                request.headers['X-Cabang-Kode'] = authStore.cabangKode
            }
            if (authStore.token) {
                request.headers['Authorization'] = `Bearer ${authStore.token}`
            }

            return request
        },
        (error) => Promise.reject(error)
    )

    // 🔥 Response interceptor - Handle 401 + Refresh Token
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config
            const authStore = useAuthStore()

            // 🔥 Jika 401 dan belum retry
            if (error.response?.status === 401 && !originalRequest._retry) {

                // 🔥 Kalau ini request refresh token sendiri yang gagal → logout
                if (originalRequest.url?.includes('/auth/refresh')) {
                    authStore.logout()
                    navigateTo('/auth/login')
                    return Promise.reject(error)
                }

                // 🔥 Jika token expired, coba refresh
                if (authStore.refreshToken && !isRefreshing) {
                    originalRequest._retry = true
                    isRefreshing = true

                    try {
                        const response = await axios.post(
                            `${config.public.apiBaseUrl}/auth/refresh`,
                            {},
                            { headers: { 'X-Refresh-Token': authStore.refreshToken } }
                        )

                        if (response.data.success) {
                            const newToken = response.data.data.token
                            authStore.token = newToken

                            // Simpan ke localStorage
                            if (process.client) {
                                localStorage.setItem('auth_token', newToken)
                            }

                            // Update header request yang gagal
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`

                            // Proses queue
                            processQueue(null, newToken)

                            // Retry request yang gagal
                            return api(originalRequest)
                        }
                    } catch (refreshError) {
                        processQueue(refreshError, null)
                        authStore.logout()
                        navigateTo('/auth/login')
                        return Promise.reject(refreshError)
                    } finally {
                        isRefreshing = false
                    }
                } else {
                    // Logout kalau tidak bisa refresh
                    authStore.logout()
                    navigateTo('/auth/login')
                }
            }

            return Promise.reject(error)
        }
    )

    return {
        provide: { api }
    }
})