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

    // Request Interceptor - TAMBAHKAN CABANG KE HEADER
    api.interceptors.request.use(
        (request) => {
            const authStore = useAuthStore()

            // 🔥 KIRIM CABANG DATABASE VIA HEADER
            if (authStore.user?.cabang_database) {
                request.headers['X-Cabang-Database'] = authStore.user.cabang_database
                console.log('📌 Send cabang:', authStore.user.cabang_database)
            }

            return request
        },
        (error) => Promise.reject(error)
    )

    return {
        provide: { api }
    }
})