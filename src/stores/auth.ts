// stores/auth.ts
import { defineStore } from 'pinia'
import { usePermissionStore } from '~/stores/permission'
import { useMenu } from '~/layouts/composables/menu.js'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        token: null as string | null,
        refreshToken: null as string | null,
        tokenExpiry: null as string | null,
        isLoggedIn: false,
        cabangKode: null as string | null,
        cabangDatabase: null as string | null
    }),

    actions: {
        setLoginData(user: any, token: string, refreshToken?: string, tokenExpiry?: string) {
            console.log('📦 setLoginData called:', {
                user: user.USER_KODE || user.kode,
                cabang: user.cabang_kode,
                hasRefreshToken: !!refreshToken
            })

            this.user = user
            this.token = token
            this.refreshToken = refreshToken || null
            this.tokenExpiry = tokenExpiry || null
            this.isLoggedIn = true
            this.cabangKode = user.cabang_kode
            this.cabangDatabase = user.cabang_database

            if (process.client) {
                localStorage.setItem('auth_user', JSON.stringify(user))
                localStorage.setItem('auth_token', token)
                if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
                if (tokenExpiry) localStorage.setItem('token_expiry', tokenExpiry)
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('cabang_kode', user.cabang_kode)
                localStorage.setItem('cabang_database', user.cabang_database)
            }

            // 🔥 Preload menu & permission (non-blocking)
            this.preloadData()
        },

        async preloadData() {
            try {
                const permStore = usePermissionStore()
                const { fetchMenu } = useMenu()

                await Promise.all([
                    permStore.fetchAll(),
                    fetchMenu()
                ])

                console.log('✅ All data preloaded (menu + permission)')
            } catch (error) {
                console.error('❌ Preload error:', error)
            }
        },

        async logout() {
            try {
                const { $api } = useNuxtApp()
                await $api.post('/logout')
            } catch (error) {
                console.error('Logout API error:', error)
            }

            // Reset state
            this.user = null
            this.token = null
            this.refreshToken = null
            this.tokenExpiry = null
            this.isLoggedIn = false
            this.cabangKode = null
            this.cabangDatabase = null

            // Reset permission & menu
            const permStore = usePermissionStore()
            permStore.reset()

            const { resetMenu } = useMenu()
            resetMenu()

            // Clear localStorage
            if (process.client) {
                localStorage.removeItem('auth_user')
                localStorage.removeItem('auth_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('token_expiry')
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('cabang_kode')
                localStorage.removeItem('cabang_database')
            }
        },

        restoreSession() {
            if (process.client) {
                const user = localStorage.getItem('auth_user')
                const token = localStorage.getItem('auth_token')
                const refreshToken = localStorage.getItem('refresh_token')
                const tokenExpiry = localStorage.getItem('token_expiry')
                const isLoggedIn = localStorage.getItem('isLoggedIn')
                const cabangKode = localStorage.getItem('cabang_kode')
                const cabangDatabase = localStorage.getItem('cabang_database')

                if (user && token && isLoggedIn === 'true') {
                    try {
                        this.user = JSON.parse(user)
                        this.token = token
                        this.refreshToken = refreshToken
                        this.tokenExpiry = tokenExpiry
                        this.isLoggedIn = true
                        this.cabangKode = cabangKode
                        this.cabangDatabase = cabangDatabase

                        console.log('🔄 Session restored')

                        // 🔥 Preload data setelah restore
                        this.preloadData()

                        return true
                    } catch (e) {
                        console.error('Failed to parse user data:', e)
                        this.logout()
                    }
                }
            }
            return false
        },

        // 🔥 Update token setelah refresh
        updateToken(newToken: string) {
            this.token = newToken
            if (process.client) {
                localStorage.setItem('auth_token', newToken)
            }
        }
    }
})