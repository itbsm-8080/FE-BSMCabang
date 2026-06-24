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

    api.interceptors.request.use(
        (request) => {
            const authStore = useAuthStore()

            // 🔥 KIRIM DATABASE CABANG (untuk switch database)
            if (authStore.cabangDatabase) {
                request.headers['X-Cabang-Database'] = authStore.cabangDatabase
                console.log('📌 Send cabang database:', authStore.cabangDatabase)
            }

            // 🔥 KIRIM KODE CABANG (untuk filter data)
            if (authStore.cabangKode) {
                request.headers['X-Cabang-Kode'] = authStore.cabangKode
                console.log('📌 Send cabang kode:', authStore.cabangKode)
            }

            return request
        },
        (error) => Promise.reject(error)
    )

    return {
        provide: { api }
    }
})