import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        isLoggedIn: false,
        cabangKode: null, // ✅ TAMBAHKAN
        cabangDatabase: null // ✅ TAMBAHKAN
    }),

    actions: {
        setLoginData(user: any, token: string) {
            console.log('📦 setLoginData called:', {
                user,
                cabang_kode: user.cabang_kode,
                cabang_database: user.cabang_database
            })

            this.user = user
            this.token = token
            this.isLoggedIn = true
            this.cabangKode = user.cabang_kode // ✅ SIMPAN KODE CABANG
            this.cabangDatabase = user.cabang_database // ✅ SIMPAN DATABASE

            if (process.client) {
                localStorage.setItem('auth_user', JSON.stringify(user))
                localStorage.setItem('auth_token', token)
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('cabang_kode', user.cabang_kode) // ✅ SIMPAN
                localStorage.setItem('cabang_database', user.cabang_database) // ✅ SIMPAN
                console.log('💾 Data saved to localStorage')
            }
        },

        async logout() {
            const { $api } = useNuxtApp()
            try {
                await $api.post('/logout')
            } catch (error) {
                console.error('Logout API error:', error)
            }

            this.user = null
            this.token = null
            this.isLoggedIn = false

            if (process.client) {
                localStorage.removeItem('auth_user')
                localStorage.removeItem('auth_token')
                localStorage.removeItem('isLoggedIn')
            }
        },

        restoreSession() {
            if (process.client) {
                const user = localStorage.getItem('auth_user')
                const token = localStorage.getItem('auth_token')
                const isLoggedIn = localStorage.getItem('isLoggedIn')
                const cabangKode = localStorage.getItem('cabang_kode')
                const cabangDatabase = localStorage.getItem('cabang_database')

                if (user && token && isLoggedIn === 'true') {
                    this.user = JSON.parse(user)
                    this.token = token
                    this.isLoggedIn = true
                    this.cabangKode = cabangKode // ✅ RESTORE
                    this.cabangDatabase = cabangDatabase // ✅ RESTORE
                    return true
                }
            }
            return false
        },
    }
})